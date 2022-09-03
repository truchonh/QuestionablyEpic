/* ---------------------------------------------------------------------------------------------- */
/*               Check if email provided is a Patron and sets the response via Prop               */
/* ---------------------------------------------------------------------------------------------- */
export function dbCheckPatron(email, setPatron) {
  let name = "";
  let realm = "NA";
  let fetchUrl = "https://questionablyepic.com/api/checkemail.php?pemail=" + email + "&pname=" + name + "&prealm=" + encodeURIComponent(realm);

  fetch(fetchUrl)
    .then((res) => res.text())
    .then((response) => {
      // alert("Success |" + response + "|");
      setPatron(response);
    })
    .catch((err) => console.log(err));
}

/* ---------------------------------------------------------------------------------------------- */
/*                    Fetch Article List from QE API and set as state via Prop                    */
/* ---------------------------------------------------------------------------------------------- */
export async function dbGetArticleList(setArticleList) {
  let fetchUrl = "https://questionablyepic.com/api/getArticleList.php";
  fetch(fetchUrl)
    .then((res) => res.json())
    .then((data) => {
      setArticleList(data);
      return data;
    })
    .catch((err) => console.log(err));
}

/* ---------------------------------------------------------------------------------------------- */
/*                    Fetch Patron Names from QE API and set as state via Prop                    */
/* ---------------------------------------------------------------------------------------------- */
export async function dbGetHallOfFame(setNames) {
  let fetchUrl = "https://questionablyepic.com/api/getHall.php";
  fetch(fetchUrl)
    .then((res) => res.json())
    .then((data) => {
      setNames(data);
      return data;
    })
    .catch((err) => console.log(err));
}

//TODO: Note this
export async function apiSendTopGearSet(player, content, score, compared) {
  let name = player.charName;
  let contentType = content;
  let itemsCompared = compared;
  let hardScore = Math.round(score);
  let fetchUrl = "https://questionablyepic.com/api/addTopGear.php?btag=" + encodeURIComponent(name) + "&content=" + contentType + "&itemscompared=" + itemsCompared + 
                    "&hardscore=" + hardScore + "&pspec=" + encodeURIComponent(player.spec.replace(" ", ""));
  console.log(fetchUrl)
  fetch(fetchUrl)
    .then((res) => res.text())
    .then((response) => {
      // alert("Success |" + response + "|");
    })
    .catch((err) => console.log(err));
}

//TODO: Note this
export async function apiSendUpgradeFinder(player, content) {
  let name = player.charName;
  let contentType = content;

  let fetchUrl = "https://questionablyepic.com/api/addUpgradeFinder.php?btag=" + encodeURIComponent(name) + "&content=" + contentType;
  fetch(fetchUrl)
    .then((res) => res.text())
    .then((response) => {
      // alert("Success |" + response + "|");
    })
    .catch((err) => console.log(err));
}

/* ---------------------------------------------------------------------------------------------- */
/*                      Get player armory image from Blizzard API via QE API                      */
/* ---------------------------------------------------------------------------------------------- */
export async function apiGetPlayerImage(player) {
  if (player !== undefined) {
    let region = player.region.toLowerCase();
    let name = player.charName.toLowerCase();
    let realm = player.realm.toLowerCase().replace(" ", "-");
    let urlReturned = "";
    let fetchUrl = "https://questionablyepic.com/api/getplayerimage.php?pregion=" + region + "&pname=" + encodeURIComponent(name) + "&prealm=" + realm;
    await fetch(fetchUrl)
      .then((res) => res.text())
      .then((response) => {
        urlReturned = response.toString();
      })
      .catch((err) => console.log(err));
    return urlReturned;
  } else {
    return "";
  }
}

export async function apiGetPlayerAvatar(player) {
  if (player !== undefined) {
    let region = player.region.toLowerCase();
    let name = player.charName.toLowerCase();
    let realm = player.realm.toLowerCase().replace(" ", "-");
    let urlReturned = "";
    let fetchUrl = "https://questionablyepic.com/api/getplayeravatar.php?pregion=" + region + "&pname=" + encodeURIComponent(name) + "&prealm=" + realm;
    await fetch(fetchUrl)
      .then((res) => res.text())
      .then((response) => {
        urlReturned = response.toString();
      })
      .catch((err) => console.log(err));
    return urlReturned;
  } else {
    return "";
  }
}

// cache image function version
export async function apiGetPlayerAvatar2(region, charName, realm, spec) {
  if (region !== undefined || charName !== undefined || realm !== undefined) {
    let newRegion = region.toLowerCase();
    let newName = charName.toLowerCase();
    let newRealm = realm.toLowerCase().replace(" ", "-");
    let urlReturned = "";
    let fetchUrl = "https://questionablyepic.com/api/getplayeravatar.php?pregion=" + newRegion + "&pname=" + encodeURIComponent(newName) + "&prealm=" + newRealm;
    await fetch(fetchUrl)
      .then((res) => res.text())
      .then((response) => {
        urlReturned = response;
        if (urlReturned !== "") {
          var res = document.createElement("link");
          res.rel = "preload";
          res.as = "image";
          res.href = urlReturned;
          document.head.appendChild(res);
        }
      })
      .catch((err) => console.log(err));
    return urlReturned;
  } else {
    return "";
  }
}

// cache image function version
export async function apiGetPlayerImage2(region, charName, realm) {
  if (region !== undefined || charName !== undefined || realm !== undefined) {
    let newRegion = region.toLowerCase();
    let newName = charName.toLowerCase();
    let newRealm = realm.toLowerCase().replace(" ", "-");
    let urlReturned = "";
    let fetchUrl = "https://questionablyepic.com/api/getplayerimage.php?pregion=" + newRegion + "&pname=" + encodeURIComponent(newName) + "&prealm=" + newRealm;
    await fetch(fetchUrl)
      .then((res) => res.text())
      .then((response) => {
        urlReturned = response;
        
        if (urlReturned !== "") {
          var res = document.createElement("link");
          res.rel = "preload";
          res.as = "image";
          res.href = urlReturned;
          document.head.appendChild(res);
        }
      })
      .catch((err) => console.log(err));
    return urlReturned;
  } else {
    return "";
  }
}

/* ---------------------------------------------------------------------------------------------- */
/*                          Sends Errors to QE API for Dev error checking                         */
/* ---------------------------------------------------------------------------------------------- */
export async function apiSendError(player, errorType, errorMessage, result) {
  const name = "";

  let fetchUrl =
    "https://questionablyepic.com/api/addError.php?btag=" +
    encodeURIComponent(name) +
    "&etype=" +
    encodeURIComponent(errorType) +
    "&emessage=" +
    encodeURIComponent(errorMessage) +
    "&eresult=" +
    encodeURIComponent(result);

  fetch(fetchUrl)
    .then((res) => res.text())
    .then((response) => {
      // alert("Success |" + response + "|");
    })
    .catch((err) => console.log(err));
}
