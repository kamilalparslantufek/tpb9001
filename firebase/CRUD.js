const axios = require("axios");
const url = "your database's rest url";
const methods = {
  READ: "READ",
  SET: "SET",
  PUSH: "PUSH",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

function doWork(method, endpoint, data, query) {
  switch (method) {
    case methods.READ:
      return readData(endpoint, query);
    case methods.SET:
      return setData(endpoint, data);
    case methods.PUSH:
      return pushData(endpoint, data);
    case methods.UPDATE:
      return updateData(endpoint, data);
    case methods.DELETE:
      return deleteData(endpoint);
    default:
      break;
  }
}

function readData(endpoint, q) {
  if (q == undefined) q = "";
  return axios.get(`${url}/${endpoint}.json${q}`).then((req) => {
    return req["data"];
  });
}

function setData(endpoint, data) {
  return axios.put(`${url}/${endpoint}.json`, data).then((req) => {
    return req.status;
  });
}

function pushData(endpoint, data) {
  return axios.post(`${url}/${endpoint}.json`, data).then((req) => {
    return req.status;
  });
}

function updateData(endpoint, data) {
  return axios.patch(`${url}/${endpoint}.json`, data).then((req) => {
    return req.status;
  });
}

function deleteData(endpoint) {
  return axios.delete(`${url}/${endpoint}.json`).then((req) => {
    return req.status;
  });
}

module.exports = { doWork, methods };
