const {rotate, translate, mirror} = require('jscad-tree-experiment').api.transformations

const servo = require('./servo')
const adafruitI2CPwmDriver = require('./pwmDriver')
const bodyTop = require('./bodyTop')
const bodyBottom = require('./bodyBottom')

const numLegs = 4
const plateThickness = 4
const plateOffset = 27

const legMountsHeight = 7.8
const legMountBoltDia = 3
const legMountDia = 20

//
const bodyId = 90
const bodyOd = 110

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

// console.log('legs', numLegs, 'legMountPositions', legMountPositions)
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
  quality: 120,
  robotName: 'ISOLOS',
  bodyId,
  bodyOd,

  legMountPositions,
  legMountAngles,
  legMountDia,
  legsOffset,
  legMountsHeight,

  plateThickness,
  plateOffset,

  assemblyMountBoltDia,
  assemblyMountPositions,
  assemblyMountAngles,

  assemblyMountDia,
  servoParams
}

function getParameterDefinitions () {
  return [
    { name: 'mainParams', type: 'group', caption: 'Main parameters' }, 

    { name: 'bodyId', type: 'float', initial: paramDefaults.bodyId, caption: 'bodyId', min: 50, max: 200 },
    { name: 'bodyOd', type: 'float', initial: paramDefaults.bodyOd, caption: 'bodyOd', min: 80, max: 200 },

    { name: 'plateThickness', type: 'float', initial: paramDefaults.plateThickness, caption: 'plateThickness', min: 1, max: 15 },
    { name: 'plateOffset', type: 'float', initial: paramDefaults.plateOffset, caption: 'plateOffset', min: 1, max: 100 },

    { name: 'visualParams', type: 'group', caption: 'Visual toggles' }, 

    { name: 'showTop', type: 'checkbox', checked: false, caption: 'Show top:' },
    { name: 'showBottom', type: 'checkbox', checked: false, caption: 'Show bottom:' },
    { name: 'showMounts', type: 'checkbox', checked: false, caption: 'Show mounts:' },
    { name: 'showServos', type: 'checkbox', checked: true, caption: 'Show servos:' },
    { name: 'showPwmDriver', type: 'checkbox', checked: false, caption: 'Show pwm driver:' }
  ]
}

function main (params) {
  console.log('initial params', params)
  params = Object.assign({}, paramDefaults, params)
  /*let foo = servo(servoParams)
  let c = color([1, 0, 0], cube({size: [0.5, 0.5, 10]}))
  c = c.connectTo(
    foo.properties.gearSplineEndConnector,
    c.properties.cube.facecenters[0],
    false,
    0
  )

  let c2 = color([1, 0, 0], cube({size: [0.5, 0.5, 10]}))
  c2 = c2.connectTo(
    foo.properties.gearSplineBaseConnector,
    c2.properties.cube.facecenters[0],
    false,
    0
  )
  return [foo, c, c2]*/
  const servos = legMountPositions
    .map((position, index) => {
      const angle = legMountAngles[index] * 180 / Math.PI
      return translate([0, 0, params.plateOffset - 0.5], translate(position, rotate([0, 0, angle],
        mirror([0, 0, 1], translate([-10, 0, 0], servo(servoParams)))
      )))
    })

  const _assemblyMount = require('./assemblyMount')(params)
  const assemblyMounts = assemblyMountPositions.map((position, index) => {
    const angle = assemblyMountAngles[index] * 180 / Math.PI
    return translate([position[0], position[1], 11.5], rotate([0, 0, angle], _assemblyMount))
  })

  let results = []
  results = params.showTop ? results.concat([translate([0, 0, params.plateOffset], bodyTop(params, servos))]) : results
  results = params.showBottom ? results.concat([bodyBottom(params, servos)]) : results
  results = params.showMounts ? results.concat(assemblyMounts) : results

   // just for visual help
  results = params.showServos ? results.concat(servos) : results
  results = params.showPwmDriver ? results.concat(translate([0, 0, legMountsHeight], rotate([0, 0, 45], adafruitI2CPwmDriver()))) : results

  return results
}

module.exports = {main, getParameterDefinitions}
