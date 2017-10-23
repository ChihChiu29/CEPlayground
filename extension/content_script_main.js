// Put your content script here.

/**
 * @fileoverview Playground file to try content script out. You can also use
 * this file to perform one-shot tasks. Do NOT check in any real content.
 */
LS_KEY_EVAL = 'evalresults';
LS_KEY_SCORES = 'evalscores';

var MASTER_PAGE_URL_INCLUDES = 'https://eval.corp.google.com/queries?eid=cynthiagan';
var WORKER_PAGE_URL_INCLUDES = 'results?eid=cynthiagan';

// Used to pause processing to the next page for debugging.
var PROCESS_TO_NEXT_PAGE = false;

EVAL = {
  urls: [],
  processedIndex: -1,
};

SCORES = {};  // (string) id: (string) score

if (window.location.href.includes(MASTER_PAGE_URL_INCLUDES)) {
  console.log('master page!');
  $('a.eas-query-link').each(function(i, elem) {
    EVAL.urls.push($(elem).attr('href'));
  });
  localSave(LS_KEY_EVAL, EVAL);
} else if (window.location.href.includes(WORKER_PAGE_URL_INCLUDES)) {
  console.log('worker page!');
  // Assuming the current page needs to be processed; this is wrong for the
  // first worker page (results will be overwriten).
  localLoad(LS_KEY_SCORES).then(function(scores) {
    if (!scores) {
      scores = {};
    }

    $('.eas-result-basic').each(function(i, elem) {
      $elem = $(elem);

      var videoUrl = $elem.find('.eas-rendered-result a').attr('href');
      if (!videoUrl || videoUrl.includes('list%3D')) {
        console.log('wrong video URL or "list" video URL; skip');
        return;
      } else {
        console.log('video URL: ' + videoUrl);
      }

      // Split URL on 'v='; assuming the result is video ID.
      var videoId = videoUrl.split('v%3D')[1];
      if (!videoId) {
        console.log('wrong video ID; skip');
        return;
      } else {
        console.log('video ID: ' + videoId);
      }

      var scoreElem = $elem.find('.eas-display-block-scores').get(0);
      var score = scoreElem.innerText.split('\n')[0].split(' ')[0];
      if (!score || score == '–') {
        console.log('wrong score; skip');
        return;
      } else {
        console.log('score: ' + score);
      }

      // Save scores locally.
      scores[videoId] = score;
    });

    return scores;
  }).then(function(scores) {
    console.log(scores);
    // Save back to storage.
    return localSave(LS_KEY_SCORES, scores);
  }).then(function() {
    // Process to the next page.
    return localLoad(LS_KEY_EVAL).then(function(eval) {
      eval.processedIndex += 1;
      if (eval.processedIndex >= eval.urls.length) {
        console.log('DONE!!');
        return;  // done, no more pages to visit.
      } else {
        var newUrl = eval.urls[eval.processedIndex];
        console.log(
            'Will process (index=' + eval.processedIndex + '): ' + newUrl);
        // Save index change then go!
        return localSave(LS_KEY_EVAL, eval).then(function() {
          window.location.href = newUrl;
        });
      }
    });
  });
}

showEvalUrls =
    function() {
  return localLoad(LS_KEY_EVAL).then(function(eval) {
    document.body.innerText = JSON.stringify(eval);
  });
};

showScores =
    function() {
  return localLoad(LS_KEY_SCORES).then(function(scores) {
    document.body.innerText = JSON.stringify(scores);
  });
};

clearAllStorage = function() {
  return chrome.storage.local.clear();
};
