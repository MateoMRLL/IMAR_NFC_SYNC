const TagModel = require("../models/tagModel");
const { forwardToPHP } = require("../utils/dataSender");
const { fetchFromPHP } = require("../utils/dataGetter");

async function getAllTags() {
  try {
    const [localTags, cloudTags] = await Promise.all([
      TagModel.getAllTags(),
      fetchFromPHP("tags"),
    ]);

    return {
      local: localTags,
      cloud: cloudTags,
    };
  } catch (err) {
    console.error("fetching failed:", err.message);
  }
}

module.exports = {
  getAllTags,
};
