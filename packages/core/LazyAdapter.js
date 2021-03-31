const BaseAdapter = require("lowdb/adapters/Base")
const fs = require("graceful-fs")

const readFile = fs.readFileSync
const writeFile = fs.writeFile

module.exports = class LazyAdapter extends BaseAdapter {
  constructor(...args) {
    super(...args)
    this.memory = {
      notifications: [],
      users: [],
    }

    if (fs.existsSync(this.source)) {
      // Read database
      try {
        const data = readFile(this.source, "utf-8").trim()
        if (data) {
          this.memory = this.deserialize(data)
        }
      } catch (e) {
        if (e instanceof SyntaxError) {
          e.message = `Malformed JSON in file: ${this.source}\n${e.message}`
        }
        throw e
      }
    }
    const updateFile = async () => {
      writeFile(this.source, this.serialize(this.memory), err => {
        if (err) {
          console.error("Write file error")
          console.error(e)
        }
        setTimeout(updateFile, 20 * 1000) // write once in 20 seconds
      })
    }
    updateFile()
  }
  read() {
    return this.memory
  }

  write(data) {
    this.memory = data
  }
}
