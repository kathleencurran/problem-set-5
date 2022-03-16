/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
function groupBy(objects, property) {
  // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
  // value for property (obj[property])
  if (typeof property !== "function") {
    const propName = property;
    property = (obj) => obj[propName];
  }

  const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
  for (const object of objects) {
    const groupName = property(object);
    //Make sure that the group exists
    if (!groupedObjects.has(groupName)) {
      groupedObjects.set(groupName, []);
    }
    groupedObjects.get(groupName).push(object);
  }

  // Create an object with the results. Sort the keys so that they are in a sensible "order"
  const result = {};
  for (const key of Array.from(groupedObjects.keys()).sort()) {
    result[key] = groupedObjects.get(key);
  }
  return result;
}

// Initialize DOM elements that will be used.


// did I make this homework more complicated than it needs to be? yes, definitely
const outputDescription = document.querySelector("#output_description");
const wordOutput = document.querySelector("#word_output");
const showRhymesButton = document.querySelector("#show_rhymes");
const showSynonymsButton = document.querySelector("#show_synonyms");
const wordInput = document.querySelector("#word_input");
const savedWords = document.querySelector("#saved_words");

const outputRow = document.querySelector("output");
const outputHeader = document.createElement("h2");
const syllableHeader = document.createElement("h3");

const loading = document.createElement("h4");
outputDescription.appendChild(loading);

outputDescription.append(outputHeader);
outputRow.append(syllableHeader);

window.onload = (event) => {
  savedWords.innerHTML = "(none)";
};

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 *
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 */

function datamuseRequest(url, callback) {
  loading.innerHTML = "Loading...";
  console.log("loading");
  fetch(url)
    .then((response) => response.json())
    .then(
      (data) => {
        callback(data);
        loading.innerHTML = "";
      },
      (err) => {
        console.error(err);
      }
    );
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
  return `https://api.datamuse.com/words?${new URLSearchParams({
    rel_rhy: wordInput.value,
  }).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 * @param {string} ml
 *   The word to find similar words for.
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
  return `https://api.datamuse.com/words?${new URLSearchParams({
    ml: wordInput.value,
  }).toString()}`;
}

let lineNo = 0;

// const saveButton = document.createElement("button");

// saveButton.classList.add("btn");
// saveButton.classList.add("btn-success");
// saveButton.innerHTML = "Save";

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 * @param {string} word
 *   The word to add.
 */
function addToSavedWords(word) {
  savedWords.innerHTML = "";
  console.log(word);
  console.log(document.getElementsByClassName(word)[0].innerHTML);
  let wordToSave = document.getElementsByClassName(word)[0].innerHTML;
  savedWordsArray.push(wordToSave);
  savedWordsArray.join(",  ");
  savedWords.innerHTML = savedWordsArray;
}

function processSynonymData() {
  let url = getDatamuseSimilarToUrl(wordInput);

  outputHeader.textContent =
    "Words with a similar meaning to " + wordInput.value;

  datamuseRequest(url, (result) => {
    if (result.length == 0) {
      wordOutput.innerHTML = "No results";
    } else {
      let wordlist = document.createElement("ul");
      wordOutput.appendChild(wordlist);

      for (let i = 0; i < result.length; i++) {
        lineNo = i;
        let eachword = document.createElement("li");

        let similarWord = document.createElement("p");
        similarWord.innerHTML = result[i]["word"];

        wordclass = `word${lineNo}`;
        // console.log(wordclass)
        similarWord.classList.add(`word${lineNo}`);

        const saveButton = document.createElement("button");

        saveButton.classList.add("btn");
        saveButton.classList.add("btn-success");
        saveButton.innerHTML = "Save";
        saveButton.classList.add(`word${lineNo}`);

        saveButton.onclick = function (e) {
          searchClass = e.target.classList[2];
          addToSavedWords(searchClass);
        };

        eachword.appendChild(similarWord);
        eachword.appendChild(saveButton);

        // eachword.classList.add(`word${lineNo}`);
        // eachword.innerHTML = similarWord.innerHTML + saveButton.outerHTML;

        wordlist.append(eachword);
      }
    }
  });
}

function processRhymeData() {
  let url = getDatamuseRhymeUrl(wordInput);

  datamuseRequest(url, (result) => {
    if (result.length == 0) {
      wordOutput.innerHTML = "No results";
    } else {
      let groups = groupBy(result, "numSyllables");
      outputHeader.textContent = "Words that rhyme with " + wordInput.value;

      for (let [k, v] of Object.entries(groups)) {
        let syllableList = document.createElement("ul");

        wordOutput.appendChild(syllableList);
        let syllableHeader = document.createElement("h3");
        syllableHeader.innerHTML = `Syllables: ${k}`;

        syllableList.append(syllableHeader);

        for (let j in v) {
          lineNo += 1;
          let eachword = document.createElement("li");
          // eachword.innerHTML = `${v[j]["word"]} ${saveButton.outerHTML}`;

          const saveButton = document.createElement("button");

          let rhymeWord = document.createElement("p");
          rhymeWord.innerHTML = v[j]["word"];

          wordclass = `word${lineNo}`;
          rhymeWord.classList.add(wordclass);

          saveButton.classList.add("btn");
          saveButton.classList.add("btn-success");
          saveButton.innerHTML = "Save";
          saveButton.classList.add(wordclass);

          saveButton.onclick = function (e) {
            searchClass = e.target.classList[2];
            addToSavedWords(searchClass);
          };

          eachword.appendChild(rhymeWord);
          eachword.appendChild(saveButton);

          syllableList.append(eachword);
        }
      }
    }
  });
}

showRhymesButton.addEventListener("click", () => {
  wordOutput.innerHTML = "";
  processRhymeData();
});

wordInput.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    console.log("hey");
    showRhymesButton.click();
    // showSynonymsButton.click();
  }
});

showSynonymsButton.addEventListener("click", () => {
  wordOutput.innerHTML = "";
  processSynonymData();
});
