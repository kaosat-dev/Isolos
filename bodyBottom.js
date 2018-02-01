const {circle} = require('@jscad/csg/api').primitives2d
const {cylinder} = require('@jscad/csg/api').primitives3d
const {color} = require('@jscad/csg/api').color
const {hull} = require('@jscad/csg/api').transformations
const {linear_extrude} = require('@jscad/csg/api').extrusions
const {rotate, translate} = require('@jscad/csg/api').transformations
const {union, difference} = require('@jscad/csg/api').booleanOps

const bolt = require('./bolts')


module.exports = function bodyBottom (params, servos) {
  console.log('bodyBottom')
  const {
    bodyId, bodyOd,
    legMountPositions, legMountDia, legMountAngles, legsOffset, legMountsHeight,
    bottomThickness,
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
    circle({r: bodyOd / 2, center: true, fn: 48}),
    circle({r: bodyId / 2, center: true, fn: 48})
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
      cylinder({h: bottomThickness, d: assemblyMountBoltDia}),
      bolt({type: 'm3'}, 10)
    )
)
  const mountHoles = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate(position, rotate([0, 0, angle], mountHole))
  })

  const bodyAndLegMounts = union(
    linear_extrude({height: bottomThickness}, bodyShape),
    linear_extrude({height: legMountsHeight}, legMountShapes)
  )

  const bottom = difference(
    bodyAndLegMounts,
    ...servoMountHoles1,
    ...servoMountHoles2,
    ...mountHoles,
    ...servos
  )
  return color([0.2, 0.2, 0.2], bottom)
}
