const {square, circle} = require('../../core/scad-api/').primitives2d
const {cube, cylinder} = require('../../core/scad-api/').primitives3d
const {color} = require('../../core/scad-api/').color
const {hull, chain_hull} = require('../../core/scad-api/').transformations
const {rectangular_extrude, linear_extrude, rotate_extrude} = require('../../core/scad-api/').extrusions
const {rotate, translate, mirror} = require('../../core/scad-api/').transformations
const {union, difference} = require('../../core/scad-api/').booleanOps

const foo = require('@jscad/scad-api')
const servo = require('./servo')
const adafruitI2CPwmDriver = require('./pwmDriver')

const numLegs = 4
const bottomThickness = 4

const legMountsHeight = 7.8
const legMountBoltDia = 3
const legMountDia = 20

//
const bodyId = 45 * 2
const bodyOd = 55 * 2

const legsOffset = 55
const angleS = (Math.PI * 2) / numLegs

const legMountAngles = Array(numLegs)
  .fill(0)
  .map((val, index) => index * angleS)

const legMountPositions = legMountAngles
  .map(angle => [Math.cos(angle) * legsOffset, Math.sin(angle) * legsOffset])

const numAssemblyMounts = 8
const assemblyMountDia = 8
const assemblyMountsOffset = (bodyOd/2 - bodyId/2) / 2 + bodyId/2
const assemblyMountBoltDia = 3
const assemblyMountAngles = Array(numAssemblyMounts)
  .fill(0)
  .map((val, index) => index * (Math.PI * 2) / numAssemblyMounts)
const assemblyMountPositions = assemblyMountAngles
  .map(angle => [Math.cos(angle) * assemblyMountsOffset, Math.sin(angle) * assemblyMountsOffset])

console.log('legs', numLegs, 'legMountPositions', legMountPositions)
const offsetWithAngle = (angle, offset) => [Math.cos(angle) * offset, Math.sin(angle) * offset]

// params for a sg90 servo
const servoParams = {
  dimensions: [23.5, 11.8, 22.7],
  gearSplineDia: 4.6,
  gearSplineHeight: 4,
  gearSplineOffset: 5.9,

  holderZOffset: 15.9,
  holderThickness: 2.5,
  holderLength: 4.7,

  mountHoleDia: 2,
  mountHoleOffsets: [-2.3, 2.3],

  gearBlockHeight: 4,
  gearBlockDia: 11.8,
  gearBlock2Dia: 5,
  gearBlock2Offset: 8.8
}

function bodyBottom () {
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

  const mountHole = color('gray', cylinder({h: bottomThickness, d: assemblyMountBoltDia}))
  const mountHoles = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate(position, rotate([0, 0, angle], mountHole))
  })

  // return bodyShape
  return difference(
    union(
      linear_extrude({height: bottomThickness}, bodyShape),
      linear_extrude({height: legMountsHeight}, legMountShapes)
    ),
    ...servoMountHoles1,
    ...servoMountHoles2,
    ...mountHoles
  )
}

function bodyTop (servos) {
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
  const mountHole = color('gray', cylinder({h: bottomThickness, d: assemblyMountBoltDia}))
  const mountHoles = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate(position, rotate([0, 0, angle], mountHole))
  })

  return difference(
    union(
      linear_extrude({height: bottomThickness}, bodyShape),
      linear_extrude({height: bottomThickness}, legMountShapes)
    ),
    cylinder({d: bodyId, h: bottomThickness}),
    ...servoHoles,
    ...mountHoles
  )
}

function main () {
  const servos = legMountPositions
    .map((position, index) => {
      const angle = legMountAngles[index] * 180 / Math.PI
      return translate(position, rotate([0, 0, angle],
        mirror([0, 0, 1], translate([-10, 0, 0], servo(servoParams)))
      )).translate([0, 0, 26.5])
    })

  console.log(servos[0])
  const assemblyMount = color('gray', 
      difference(
        cylinder({h: 27 - bottomThickness, d: assemblyMountDia}),
        cylinder({h: 27 - bottomThickness, d: assemblyMountBoltDia})
      )
    )
    .translate([0, 0, bottomThickness])
  const assemblyMounts = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate(position, rotate([0, 0, angle], assemblyMount))
  })
  return [
    bodyBottom().subtract(servos),
    translate([0, 0, 27], bodyTop(servos)),
    // just for visual help
    ...servos,
    ...assemblyMounts,
    translate([0, 0, legMountsHeight], rotate([0, 0, 45], adafruitI2CPwmDriver()))
  ]

  const legMounts = legMountPositions.map(function (position) {
    return translate(position, circle({r: legMountDia * 0.5, center: true}))
  })
  const bodyHalfBaseShape = chain_hull(...legMounts)
  const bodyBaseShape = hull(union(bodyHalfBaseShape, mirror([0, 1, 0], bodyHalfBaseShape)))

  // return bodyHalfBaseShape
  const bodyHalf = chain_hull(...legMounts)
    .subtract(legMountPositions.map(position => translate(position, circle({r: legMountBoltDia * 0.5, center: true}))))
  const fullBody = union(bodyHalf, mirror([0, 1, 0], bodyHalf))

  const cover = color([0.4, 0.9, 0.9, 0.5],
    linear_extrude({height: bottomThickness}, bodyBaseShape)
      .translate([0, 0, 70])
  )

  return [
    linear_extrude({height: legMountsHeight}, fullBody, bodyBaseShape)
      .union(linear_extrude({height: bottomThickness}, bodyBaseShape))
      .subtract(servos),

    // ...servos,
    mirror([0, 1, 0], servos),
    translate([0, 0, bottomThickness], adafruitI2CPwmDriver()),
    cover
  ]
  // return legMounts
}

module.exports = main
