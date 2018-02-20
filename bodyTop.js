const {circle} = require('@jscad/csg/api').primitives2d
const {cylinder} = require('@jscad/csg/api').primitives3d
const {color} = require('@jscad/csg/api').color
const {hull} = require('@jscad/csg/api').transformations
const {linear_extrude} = require('@jscad/csg/api').extrusions
const {rotate, translate, mirror} = require('@jscad/csg/api').transformations
const {union, difference} = require('@jscad/csg/api').booleanOps

const bolt = require('./bolts')

module.exports = function bodyTop (params, servos) {
  const {
    bodyId, bodyOd,
    legMountPositions, legMountDia,
    plateThickness,
    assemblyMountBoltDia,
    assemblyMountPositions,
    assemblyMountAngles
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

  const servoHoles = servos.map(servo => translate([0, 0, 4.2], servo))
  const mountHole = color('gray',
    union(
      cylinder({h: plateThickness, d: assemblyMountBoltDia}),
      translate([0, 0, plateThickness], mirror([0, 0, 1], bolt({type: 'm3'}, 10)))
    )
  )
  const mountHoles = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate(position, rotate([0, 0, angle], mountHole))
  })

  const bodyAndLegMounts = union(
    linear_extrude({height: plateThickness}, bodyShape),
    linear_extrude({height: plateThickness}, legMountShapes)
  )

  const top = difference(
    bodyAndLegMounts,
    cylinder({d: bodyId, h: plateThickness}),
    ...servoHoles,
    ...mountHoles
  )
  return color([0.2, 0.2, 0.2], top)
}
