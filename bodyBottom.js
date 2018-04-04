const {circle} = require('jscad-tree-experiment').api.primitives2d
const {cylinder} = require('jscad-tree-experiment').api.primitives3d
const {color} = require('jscad-tree-experiment').api.color
const {vector_text} = require('jscad-tree-experiment').api.text
const {hull} = require('jscad-tree-experiment').api.transformations
const {linear_extrude, rectangular_extrude, rotate_extrude} = require('jscad-tree-experiment').api.extrusions
const {rotate, translate, scale, center, mirror} = require('jscad-tree-experiment').api.transformations
const {union, difference} = require('jscad-tree-experiment').api.booleanOps

const bolt = require('./bolts')

module.exports = function bodyBottom (params, servos) {
  console.log('bodyBottom')
  const {
    quality,
    robotName,
    bodyId, bodyOd,
    legMountPositions, legMountDia, legMountAngles, legsOffset, legMountsHeight,
    plateThickness,
    assemblyMountBoltDia,
    assemblyMountPositions,
    assemblyMountAngles,

    servoParams
  } = params
  const legMounts = legMountPositions.map(function (position) {
    return translate(position, circle({r: legMountDia * 0.5, center: true}))
  })

  const legMountShapes = union(
    hull(...legMounts.filter((x, i) => i % 2 === 0)),
    hull(...legMounts.filter((x, i) => i % 2 !== 0))
  )
  const bodyOuter = difference(
    circle({r: bodyOd / 2, center: true, fn: quality}),
    circle({r: bodyId / 2, center: true, fn: quality})
  )

  const bodyShape = union(
    bodyOuter
  )
  const offsetWithAngle = (angle, offset) => [Math.cos(angle) * offset, Math.sin(angle) * offset]

  const servoMountHoleDiaReduced = servoParams.mountHoleDia * 0.5
  const servoMountHoles1 = legMountAngles
    .map((angle, index) => {
      const offset = offsetWithAngle(angle, legsOffset + 4)
      return translate([offset[0], offset[1]],
        cylinder({d: servoMountHoleDiaReduced, h: legMountsHeight * 10, center: true})
      )
    })
  const servoMountHoles2 = legMountAngles
    .map((angle, index) => {
      const offset = offsetWithAngle(angle, legsOffset - 24)
      return translate([offset[0], offset[1]],
        cylinder({d: servoMountHoleDiaReduced, h: legMountsHeight * 10, center: true})
      )
    })

  const mountHole = color('gray',
    union(
      cylinder({h: plateThickness, d: assemblyMountBoltDia}),
      bolt({type: 'm3'}, 10)
    )
)
  const mountHoles = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate(position, rotate([0, 0, angle], mountHole))
  })

  const bodyAndLegMounts = union(
    linear_extrude({height: plateThickness}, bodyShape),
    linear_extrude({height: legMountsHeight}, legMountShapes)
  )

  // for center part with electronics etc
  const recessHeight = legMountsHeight - plateThickness
  const centerRecess = translate([0, 0, plateThickness],
    cylinder({r2: 28, r1: 24, center: [true, true, false], h: recessHeight, fn: quality}) // linear_extrude({height: recessHeight}, circle({r: 30, center: true}))
  )

  // text
  const textThickness = 1
  const name = translate([25, -5, textThickness], scale([0.5, 0.5, 1], rotate([0, -180, 0], text2({h: textThickness}, robotName))))
  
  function text (string) {
    const chars = string.split('')
    const chars3d = chars.map(function (char) {
      return union(
        vector_text(0, 0, char).map(lineSegment => rectangular_extrude(lineSegment, {w: 5, h: 2, fn: 28}))
      )
    })
    return chars3d
  }
  function text2 (options, string) {
    const {h} = options
    const lineSegments = vector_text(0, 0, string)
    const result = union(
      lineSegments.map(lineSegment => rectangular_extrude(lineSegment, { w: 2, h }))
    )
    return result
  }

  const bottom = difference(
    bodyAndLegMounts,
    ...servoMountHoles1,
    ...servoMountHoles2,
    ...mountHoles,
    ...servos,
    centerRecess,
    name
  )
  return color([0.2, 0.2, 0.2], bottom)
}
