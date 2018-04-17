const shouldNotHaveProperties = (object, properties, message) => {
  properties.forEach(property => {
    if (object[property] != null) {
      throw new Error(message)
    }
  })
}

const shouldHaveProperties = (object, properties, message) => {
  properties.forEach(property => {
    if (object[property] == null) {
      throw new Error(message)
    }
  })
}

class Validations {
  constructor (shouldRun) {
    this.shouldRun = shouldRun
  }
  shouldBePixel (object) {
    if (!this.shouldRun) return
    shouldHaveProperties(
      object,
      ['red', 'green', 'blue', 'alpha'],
      `Expected ${JSON.stringify(
        object
      )} to have red, green, blue, and alpha properties.`
    )
    shouldNotHaveProperties(
      object,
      ['x', 'y'],
      `Expected ${JSON.stringify(object)} to be a pixel, but was a point.`
    )
  }
  shouldBePoint (object) {
    if (!this.shouldRun) return
    shouldNotHaveProperties(
      object,
      ['red', 'green', 'blue', 'alpha'],
      `Expected ${JSON.stringify(
        object
      )} to be a point, but was a pixel instead.`
    )
    shouldHaveProperties(
      object,
      ['x', 'y'],
      `Expected ${JSON.stringify(
        object
      )} to be a point, but it didn't have an x and y property.`
    )
  }
}

export default Validations
