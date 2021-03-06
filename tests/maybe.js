"use strict"

const assert = require("assert")
const { "do": do_, Just, Nothing, Maybe, Monad } = require("../index")

function* maybeComp(g, stack) {
  const results = []
  results.push(yield Just(1))
  results.push(yield Just(2))
  results.push(yield Just(3))
  if (g) {
    const inner = yield* do_(g, null, stack)
    if (Array.isArray(inner))
      Array.prototype.push.apply(results, inner)
    else
      results.push(inner)
  }
  return results
}

function* maybeCompFail() {
  const results = []
  results.push(yield Just(1))
  results.push(yield Nothing)
  results.push(yield Just(3))
  return results
}

describe("Maybe", function() {
  describe("Just", () => {
    it("should construct instance of Just", () => {
      assert.equal(Just(null) instanceof Just, true)
    })

    it("should construct instance of Maybe", () => {
      assert.equal(Just(null) instanceof Maybe, true)
    })

    it("should construct instance of Monad", () => {
      assert.equal(Just(null) instanceof Monad, true)
    })
  })

  describe("Nothing", () => {
    it("should be an instance of Maybe", () => {
      assert.equal(Nothing instanceof Maybe, true)
    })

    it("should be an instance of Monad", () => {
      assert.equal(Nothing instanceof Monad, true)
    })
  })

  it("should return the result", done => {
    do_(maybeComp.bind(null, null), results => {
      assert.deepStrictEqual(results, [1, 2, 3])
      done()
    })
  })

  it("should return Nothing on failure", done => {
    do_(maybeCompFail, result => {
      assert.equal(result === Nothing, true)
      done()
    })
  })

  it("should yield* from a successful computation", done => {
    do_(
      maybeComp.bind(null, maybeComp.bind(null, null)),
      results => {
        assert.deepStrictEqual(results, [1,2,3,1,2,3])
        done()
      }
    )
  })

  it("should yield* from a failing computation", done => {
    do_(
      maybeComp.bind(null, maybeCompFail),
      results => {
        assert.deepStrictEqual(results.slice(0, 3), [1,2,3])
        assert.strictEqual(results[3] === Nothing, true)
        done()
      }
    )
  })

  it("should yield* from yield* from a successful computation", done => {
    do_(
      maybeComp.bind(
        null,
        maybeComp.bind(
          null,
          maybeComp.bind(null, null)
        )
      ),
      results => {
        assert.deepStrictEqual(results, [1,2,3,1,2,3,1,2,3])
        done()
      })
  })

  it("should yield* from yield* from a failing computation", done => {
    do_(
      maybeComp.bind(
        null,
        maybeCompFail.bind(
          null,
          maybeCompFail
        )
      ),
      results => {
        assert.deepStrictEqual(results.slice(0,3), [1,2,3])
        assert.strictEqual(results[3] === Nothing, true)
        done()
      })
  })
})

module.exports = {
  maybeComp,
  maybeCompFail,
}
