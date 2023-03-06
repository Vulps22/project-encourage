const Question = require('./question.js');

class DashboardHandler {
  constructor() {
    const Database = require("@replit/database");
    this.db = new Database();
  }

  async getTruths(callback) {
    try {
      this.db.get("truths").then(truths => {
        const truthArray = truths.map((truth, index) => {
          const question = new Question(truth.question, truth.creator);
          question.id = index;
          return question.toJson();
        });
        callback(truthArray);
      })
    } catch (error) {
      console.log("Error");
      console.error(error);
      callback(error.message);
    }
  }

  async getDares(callback) {
    try {
      this.db.get("dares").then(dares => {
        const dareArray = dares.map((dare, index) => {
          const question = new Question(dare.question, dare.creator);
          question.id = index;
          return question.toJson();
        });
        callback(dareArray);
      })
    } catch (error) {
      console.log("Error");
      console.error(error);
      callback(error.message);
    }
  }


  async getDareReviewables(callback) {
    try {
      this.db.get("dare_review").then(dares => {
        if (!dares) dares = [];
        const dareArray = dares.map((dare, index) => {
          const question = new Question(dare.question, dare.creator);
          question.id = index;
          return question.toJson();
        });
        callback(dareArray);
      })
    } catch (error) {
      console.log("Error");
      console.error(error);
      callback(error.message);
    }
  }

  async getServers(callback) {
    try {
      const servers = await this.db.list("guild");
      const serverArray = await Promise.all(servers.map(async (guildId, index) => {
        const guild = await this.db.get(guildId);
        guild.key = guildId
        console.log(guild)
        return guild
      }));
      console.log("Return!")
      callback(serverArray);
    } catch (error) {
      console.log("Error");
      console.error(error);
      callback(error.message);
    }
  }

  async banDare(id, callback) {

  }

  async deleteTruth(id, callback) {
    console.log(id)
    try {
      if (!id && id !== 0) {
        callback(false);
        return;
      }

      this.db.get("truths").then((truths) => {
        const x = truths.splice(id, 1);
        this.db.set("truths", truths).then(() => {
          callback(true)
        })
      })
    } catch (error) {
      console.log(error.message)
      callback(false)
    }
  }

  async deleteDare(id, callback) {
    console.log(id)
    try {
      if (!id && id !== 0) {
        callback(false);
        return;
      }

      this.db.get("dares").then((dares) => {
        const x = dares.splice(id, 1);
        this.db.set("dares", dares).then(() => {
          callback(true)
        })
      })
    } catch (error) {
      console.log(error.message)
      callback(false)
    }
  }

  async deleteDareReviewable(id, callback) {
    console.log(id)
    try {
      if (!id && id !== 0) {
        callback(false);
        return;
      }

      this.db.get("dare_review").then((dares) => {
        console.log(dares);
        const x = dares.splice(id, 1);
        this.db.set("dare_review", dares).then(() => {
          callback(true)
        })
      })
    } catch (error) {
      console.log(error.message)
      callback(false)
    }
  }

  async approveDareReviewable(id, callback) {
    try {
      if (!id && id !== 0) {
        callback(false);
        return;
      }

      this.db.get("dare_review").then((reviewables) => {
        let dare = reviewables[id]
        dare = new Question(dare.question, dare.creator)
        this.db.get("dares").then((dares) => {
          dares.push(dare);
          this.db.set("dares", dares).then(() => {
            this.deleteDareReviewable(id, () => {
              callback(true)
            })
          })
        })
      })
    } catch (error) {
      console.log(error.message)
      callback(false)
    }
  }
}


module.exports = DashboardHandler;