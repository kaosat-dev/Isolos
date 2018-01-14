const {square, circle} = require('../../core/scad-api/').primitives2d
const {cube, cylinder} = require('../../core/scad-api/').primitives3d
const {color} = require('../../core/scad-api/').color
const {hull, chain_hull} = require('../../core/scad-api/').transformations
const {rectangular_extrude, linear_extrude, rotate_extrude} = require('../../core/scad-api/').extrusions
const {rotate, translate, mirror} = require('../../core/scad-api/').transformations
const {union, difference} = require('../../core/scad-api/').booleanOps

const servo = require('./servo')
const adafruitI2CPwmDriver = require('./pwmDriver')

const servoDims = [25, 10, 20]
const bodyLength = 100
const bodyWidth = servoDims[0] * 2 + 10
const bottomThickness = 4

const legMountsHeight = 30
const legMountBoltDia = 3
const legMountDia = 10
const legMountPositions = [
  [bodyLength / 2, bodyWidth / 2],
  [0, bodyWidth / 2 + 20],
  [-bodyLength / 2, bodyWidth / 2]
]

const servoPositions = [
  [bodyLength / 2, bodyWidth / 2 - 8, 26.7],
  // [0, bodyWidth / 2 + 12, 24],
  [-bodyLength / 2, bodyWidth / 2 - 8, 26.7]
]

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
function main () {
  const legMounts = legMountPositions.map(function (position) {
    return translate(position, circle({r: legMountDia * 0.5, center: true}))
  })
  const bodyHalfBaseShape = chain_hull(...legMounts)
  const bodyBaseShape = hull(union(bodyHalfBaseShape, mirror([0, 1, 0], bodyHalfBaseShape)))

  // return bodyHalfBaseShape
  const bodyHalf = chain_hull(...legMounts)
    .subtract(legMountPositions.map(position => translate(position, circle({r: legMountBoltDia * 0.5, center: true}))))
  const fullBody = union(bodyHalf, mirror([0, 1, 0], bodyHalf))
  const servos = servoPositions
    .map(position =>
      translate(position,
        mirror([0, 0, 1], rotate([0, 0, 90], servo(servoParams)))
      )
    )

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
