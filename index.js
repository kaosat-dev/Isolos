const {square, circle} = require('@jscad/csg/api').primitives2d
const {cube, cylinder} = require('@jscad/csg/api').primitives3d
const {color} = require('@jscad/csg/api').color
const {hull, chain_hull} = require('@jscad/csg/api').transformations
const {rectangular_extrude, linear_extrude, rotate_extrude} = require('@jscad/csg/api').extrusions
const {rotate, translate, mirror} = require('@jscad/csg/api').transformations
const {union, difference} = require('@jscad/csg/api').booleanOps

const servo = require('./servo')
const adafruitI2CPwmDriver = require('./pwmDriver')
const bodyTop = require('./bodyTop')
const bodyBottom = require('./bodyBottom')

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
const assemblyMountsOffset = (bodyOd / 2 - bodyId / 2) / 2 + bodyId / 2
const assemblyMountBoltDia = 3
const assemblyMountAnglesOffset = Math.PI * 1.125
const assemblyMountAngles = Array(numAssemblyMounts)
  .fill(0)
  .map((val, index) => index * (Math.PI * 2) / numAssemblyMounts + assemblyMountAnglesOffset)
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

const paramDefaults = {
  bodyId,
  bodyOd,

  legMountPositions,
  legMountAngles,
  legMountDia,
  legsOffset,
  legMountsHeight,

  bottomThickness,
  assemblyMountBoltDia,
  assemblyMountPositions,
  assemblyMountAngles,

  assemblyMountDia,
  servoParams
}

function getParameterDefinitions () {
  return [
    { name: 'showTop', type: 'checkbox', checked: true, caption: 'Show top:' },
    { name: 'showBottom', type: 'checkbox', checked: false, caption: 'Show bottom:' },
    { name: 'showMounts', type: 'checkbox', checked: true, caption: 'Show mounts:' },
    { name: 'showServos', type: 'checkbox', checked: true, caption: 'Show servos:' },
    { name: 'showPwmDriver', type: 'checkbox', checked: true, caption: 'Show pwm driver:' }
  ]
}

function main (params) {
  const servos = legMountPositions
    .map((position, index) => {
      const angle = legMountAngles[index] * 180 / Math.PI
      return translate(position, rotate([0, 0, angle],
        mirror([0, 0, 1], translate([-10, 0, 0], servo(servoParams)))
      )).translate([0, 0, 26.5])
    })

  const _assemblyMount = require('./assemblyMount')(paramDefaults)
  const assemblyMounts = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate(position, rotate([0, 0, angle], _assemblyMount))
  })

  const _bodyBottom = bodyBottom(paramDefaults, servos)
  let results = []
  results = params.showTop ? results.concat([translate([0, 0, 27], bodyTop(paramDefaults, servos))]) : results
  results = params.showBottom ? results.concat([_bodyBottom]) : results
  results = params.showMounts ? results.concat(assemblyMounts) : results

   // just for visual help
  results = params.showServos ? results.concat(servos) : results
  results = params.showPwmDriver ? results.concat(translate([0, 0, legMountsHeight], rotate([0, 0, 45], adafruitI2CPwmDriver()))) : results

  return results
}

module.exports = {main, getParameterDefinitions}
