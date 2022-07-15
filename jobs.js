const path = require("path");
const firebase = require(path.join(__dirname, "firebase"));
const ax = require("axios");

let config = {
  ig_id: process.env.ig_id,
  ig_token: process.env.ig_token,
  firebase_database_token: process.env.firebase_database_token,
};

let tags = "tags";
let caption = "caption";

console.log(`job started at ${Date(Date.now())}`);
//getting data from firebase
firebase.crud
  .doWork(firebase.crud.methods.READ, "list") // list is our table/json endpoint for media lists
  .then((result) => {
    //getting objects out of list and sorting on ascending order by total share count
    let resultList = Object.values(result);
    let minValList = resultList.sort((a, b) => (a.totalShareCount > b.totalShareCount ? 1 : -1));
    minValList = getMinValList(resultList);
    //get random minimum totalsharecount image and update it
    let media = minValList[Math.floor(Math.random() * minValList.length)];
    console.log(media);
    let updateMedia = media;
    updateMedia.totalShareCount = updateMedia.totalShareCount + 1;
    firebase.crud.doWork(firebase.crud.methods.UPDATE, `list/${updateMedia.key}`, updateMedia);
    // creating facebook container with media's data, creating url
    url = `https://graph.facebook.com/v13.0/${config.ig_id}/media?`;
    if (media.type == "VIDEO")
      url += `video_url=${media.url}&media_type=VIDEO&caption=%0ATitle:${media.title}%0A${caption}${tags}&access_token=${config.ig_token}`;
    else {
      url += `image_url=${media.url}&caption=%0ATitle:${media.title}%0A${caption}${tags}&access_token=${config.ig_token}`;
    }
    //check container status after creating facebook media container
    ax.post(url)
      .then(async (containerPostResult) => {
        console.log("default wait value for instagram container uploading");
        return axiosSleep(15000, containerPostResult.data.id);
      })
      .then((id) => {
        return ax.get(`https://graph.facebook.com/v13.0/${id}?fields=status&access_token=${config.ig_token}`);
      })
      .then((containerStatusResult) => {
        //if its finished uploading, all you need to do is posting container id to facebook api to publish it.
        if (containerStatusResult.data.status.includes("Finished")) {
          ax.post(
            `https://graph.facebook.com/v13.0/${config.ig_id}/media_publish?creation_id=${containerStatusResult.data.id}&access_token=${config.ig_token}`
          ).then((res) => {
            console.log(res);
          });
        } else {
          console.log("container upload is not finished, might be an error.");
        }
      });
  })
  .catch((ex) => console.log("there was an error on posting." + ex));

// order list by total share count. firebase realtime database calls return ascending ordered
function getMinValList(list) {
  let newlist = [];
  let minval = list[0].totalShareCount;
  for (let i = 0; i < list.length; i++) {
    if (list[i].totalShareCount > minval) {
    } else {
      newlist.push(list[i]);
    }
  }
  return newlist;
}
//to make code sleep where i want, i need this func
function axiosSleep(ms, val) {
  return new Promise((resolve) => setTimeout(resolve, ms, val));
}
