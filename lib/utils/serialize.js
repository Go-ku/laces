// lib/utils/serialize.js
export const serializeDoc = (doc) => {
  const json = doc.toJSON ? doc.toJSON() : doc;

  for (const key in json) {
    const val = json[key];
    if (val instanceof Date) {
      json[key] = val.toISOString();
    } else if (val?._bsontype === "ObjectID") {
      json[key] = val.toString();
    }
  }

  return json;
};
