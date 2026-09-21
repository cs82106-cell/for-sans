/* =========================================================
   Sans Birthday
   script.js
========================================================= */


/* =========================================================
   ★ 開發測試起點

   開發時只需要改這一行：

   "normal"
   → 完整流程
   → 開場 NPC → 五題 → NPC 轉場 → 星空祝福

   "transition"
   → 直接從問答結束後的 NPC 轉場開始
   → 「呼——」開始

   "blessing"
   → 直接跳過 NPC
   → 從星空祝福開始

   ★ 正式交給 Sans 前記得改回：
   const START_MODE = "normal";
========================================================= */

const START_MODE = "normal";

/* =========================================================
   ★ 暫時：第二段星空祝福卡點測試

   true  = FOR SANS 點擊後直接進星空祝福
   false = 恢復完整正式流程
========================================================= */

const SKIP_TO_BLESSING_AFTER_START = false;

/*
   ★ 結尾按「從頭再看一次」時，
     會帶 ?restart=1 重新載入。
     這樣即使開發時 START_MODE 不是 normal，
     也會真的從整個網頁最前面開始。
*/
const FORCE_NORMAL_START =
    new URLSearchParams(
        window.location.search
    ).get("restart") === "1";



/* =========================================================
   進入畫面 + 第一段 NPC BGM
========================================================= */

const entryScreen =
    document.getElementById(
        "entry-screen"
    );


const npcBgm =
    new Audio(
        "assets/audio/npc_bgm.mp3"
    );

npcBgm.loop = true;

/*
   ★ NPC 對話期間背景音量
   0.18 = 18%
*/
npcBgm.volume = 0.18;

npcBgm.preload = "auto";


let entryStarted = false;

let npcBgmStarted = false;

let npcBgmFadeTimer = null;


/* =========================================================
   第二主題：星空祝福 BGM

   檔案位置：
   assets/audio/幾分之幾.mp3

   播放範圍：
   星空祝福開始
   ↓
   「如願」
   ↓
   黑屏轉場
   ↓
   生日煙火真正開始前淡出停止
========================================================= */

let blessingBgm = null;

function getBlessingBgm() {

    if (!blessingBgm) {

        blessingBgm = new Audio(
            "assets/audio/幾分之幾.mp3"
        );

        blessingBgm.loop = true;
        blessingBgm.volume = 0.20;
        blessingBgm.preload = "metadata";

    }

    return blessingBgm;
}


let blessingBgmStarted = false;

let blessingBgmUnlocked = false;

let blessingBgmFadeTimer = null;


/* =========================================================
   ★ 第二段音樂 / 星空尾聲，可自行微調的時間

   blessingMusicStartAfter
   = 「嗨Sans」完全顯示後，多久開始播放幾分之幾
   800 = 0.8 秒
   1000 = 1 秒
   600 = 0.6 秒

   blessingStarTailDuration
   = 「如願」完全淡出後，純星空再停留多久
   目前先設 4200ms = 4.2 秒

   之後請直接改這兩個數字即可。
========================================================= */

const blessingMusicStartAfter = 150;

const blessingStarTailDuration = 4200;


/* =========================================================
   在最開始「點擊開啟」時先解鎖第二首音樂

   ★ 這是為了避免部分瀏覽器到了第二段時，
     因為不是當下的直接點擊而阻擋播放。

   ★ 這裡音量先設成 0，所以不會提早聽到。
========================================================= */

function unlockBlessingBgm() {

    // iPhone Safari：開場時不要播放或建立第二段音樂。
    blessingBgmUnlocked = true;

}


/* =========================================================
   播放第二段「幾分之幾」
========================================================= */

function startBlessingBgm() {

    if (blessingBgmStarted) {
        return;
    }

    const blessingAudio = getBlessingBgm();

    blessingBgmStarted = true;

    /*
       ★ 不做淡入。
         播放時直接使用第二段設定音量 20%。
    */

    blessingAudio.volume = 0.20;


    const playPromise =
        blessingAudio.play();


    if (
        playPromise !== undefined
    ) {

        playPromise.catch(
            error => {

                blessingBgmStarted = false;

                console.log(
                    "第二段 BGM 無法播放：",
                    error
                );

            }
        );

    }

}


/* =========================================================
   第二段 BGM 淡出
========================================================= */

function fadeOutBlessingBgm(
    duration = 1500
) {

    if (!blessingBgm) {
        blessingBgmStarted = false;
        return;
    }


    if (blessingBgmFadeTimer) {

        clearInterval(
            blessingBgmFadeTimer
        );

        blessingBgmFadeTimer = null;

    }


    if (
        blessingBgm.paused ||
        !blessingBgmStarted
    ) {

        blessingBgmStarted = false;

        return;

    }


    const startVolume =
        blessingBgm.volume;

    const steps = 30;

    const stepTime =
        duration / steps;

    let currentStep = 0;


    blessingBgmFadeTimer =
        setInterval(() => {

            currentStep++;

            const progress =
                currentStep / steps;

            blessingBgm.volume =
                Math.max(
                    0,
                    startVolume *
                    (1 - progress)
                );


            if (
                currentStep >= steps
            ) {

                clearInterval(
                    blessingBgmFadeTimer
                );

                blessingBgmFadeTimer = null;

                blessingBgm.pause();

                blessingBgm.currentTime = 0;

                blessingBgm.volume = 0.20;

                blessingBgmStarted = false;

            }

        }, stepTime);

}



/* =========================================================
   第三主題：煙火祝福 BGM

   檔案位置：
   assets/audio/HBD.mp3

   ★ 如果之後你的檔名不同，
     只要改這一行路徑即可。
========================================================= */

let fireworksBgm = null;

function getFireworksBgm() {

    if (!fireworksBgm) {

        fireworksBgm = new Audio(
            "assets/audio/HBD.mp3"
        );

        fireworksBgm.loop = true;
        fireworksBgm.volume = 0.22;
        fireworksBgm.preload = "metadata";

    }

    return fireworksBgm;
}


let fireworksBgmStarted = false;

let fireworksBgmUnlocked = false;


/* =========================================================
   在最開始「點擊開啟」時先解鎖第三首 BGM

   ★ 避免到了煙火篇時，
     瀏覽器因為不是直接點擊而阻擋播放。

   ★ 音量先設 0，所以不會提前出聲。
========================================================= */

function unlockFireworksBgm() {

    // iPhone Safari：開場時不要播放或建立第三段音樂。
    fireworksBgmUnlocked = true;

}


/* =========================================================
   播放第三段 HBD BGM
========================================================= */

function startFireworksBgm() {

    if (fireworksBgmStarted) {
        return;
    }

    const fireworksAudio = getFireworksBgm();

    fireworksBgmStarted = true;

    fireworksAudio.volume = 0.22;


    const playPromise =
        fireworksAudio.play();


    if (
        playPromise !== undefined
    ) {

        playPromise.catch(
            error => {

                fireworksBgmStarted = false;

                console.log(
                    "第三段 HBD BGM 無法播放：",
                    error
                );

            }
        );

    }

}



/* =========================================================
   播放第一段 NPC BGM
========================================================= */

function startNpcBgm() {

    if (npcBgmStarted) {
        return;
    }

    npcBgmStarted = true;

    npcBgm.volume = 0.18;


    const playPromise =
        npcBgm.play();


    if (
        playPromise !== undefined
    ) {

        playPromise.catch(
            error => {

                npcBgmStarted = false;

                console.log(
                    "NPC BGM 無法播放：",
                    error
                );

            }
        );

    }

}


/* =========================================================
   第一段 NPC BGM 淡出
========================================================= */

function fadeOutNpcBgm(
    duration = 1200
) {

    if (npcBgmFadeTimer) {

        clearInterval(
            npcBgmFadeTimer
        );

        npcBgmFadeTimer = null;

    }


    if (
        npcBgm.paused ||
        !npcBgmStarted
    ) {

        npcBgmStarted = false;

        return;

    }


    const startVolume =
        npcBgm.volume;

    const steps = 30;

    const stepTime =
        duration / steps;

    let currentStep = 0;


    npcBgmFadeTimer =
        setInterval(() => {

            currentStep++;

            const progress =
                currentStep / steps;

            npcBgm.volume =
                Math.max(
                    0,
                    startVolume *
                    (1 - progress)
                );


            if (
                currentStep >= steps
            ) {

                clearInterval(
                    npcBgmFadeTimer
                );

                npcBgmFadeTimer = null;

                npcBgm.pause();

                npcBgm.currentTime = 0;

                npcBgm.volume = 0.18;

                npcBgmStarted = false;

            }

        }, stepTime);

}


/* =========================================================
   點擊「FOR SANS / 點擊開啟」

   ★ 這一個使用者手勢同時做三件事：

   1. 播放 BGM
   2. 解除 NPC 動畫暫停
   3. 淡出進入畫面

   這樣 NPC 一開始走進場，
   音樂就已經同步開始。
========================================================= */

function startFullBirthdayCard() {

    if (entryStarted) {
        return;
    }

    entryStarted = true;

    /*
       ★ 最初點擊時先解鎖第二段「幾分之幾」。
       不會提前出聲。
    */

    /*
       ★ 同一個點擊手勢也預先解鎖第三段 HBD BGM。
       此時不會出聲。
    */

    document.body.classList.remove(
        "site-not-started"
    );

    entryScreen.classList.add(
        "hide"
    );

    /*
       ★ 第二段卡點測試模式
       FOR SANS → 點擊開啟 → 直接進星空祝福
    */
    if (
        SKIP_TO_BLESSING_AFTER_START
    ) {

        birthdayWish =
            localStorage.getItem(
                "sansBirthdayWish"
            ) || "";

        setTimeout(() => {

            entryScreen.hidden = true;

            startBlessingScene();

        }, 900);

        return;
    }

    /*
       ★ 正式完整流程
    */
    startNpcBgm();

    setTimeout(() => {

        dialogBox.classList.add(
            "show"
        );

        showDialogue();

    }, 5100);

    setTimeout(() => {

        entryScreen.hidden = true;

    }, 900);

}


entryScreen.addEventListener(
    "click",
    startFullBirthdayCard
);




/* =========================================================
   開場 NPC 對話
========================================================= */

const dialogues = [
    "聽說，今天是一位叫做 Sans 的萌妹生日……",
    "小李姐姐派我來送生日祝福",
    "……？",
    "怎麼還有五個問題(｡ŏ_ŏ)",
    "你家姐姐事真多(ಠ_ಠ)",
    "算了，來都來了。",
    "Sans，接好！！！！"
];


/* =========================================================
   開場 NPC 圖片
========================================================= */

const npcImages = [
    "assets/images/NPC.png",
    "assets/images/NPC_paper.png",
    "assets/images/NPC_question.png",
    "assets/images/NPC_question.png",
    "assets/images/NPC_question.png",
    "assets/images/NPC_paper.png",
    "assets/images/NPC_paper.png"
];


/* =========================================================
   Q1 ～ Q3 題目
========================================================= */

const questions = [
    {
        title: "請問 Sans 最大的優點是什麼？",

        options: [
            {
                letter: "A",
                text: "聲線迷人，唱功扎實",
                comment: "開口即淪陷，確實犯規！"
            },
            {
                letter: "B",
                text: "有深度及獨特個人魅力",
                comment: "真正迷人的，從來不只表面！"
            },
            {
                letter: "C",
                text: "長得好看，顏值在線",
                comment: "嗯，這題本人應該沒有異議吧？"
            },
            {
                letter: "D",
                text: "以上皆是",
                comment: "很會選嘛，優點這麼多確實沒必要硬挑一個！"
            }
        ]
    },

    {
        title: "資深粉絲小李最突出的特質是什麼？",

        options: [
            {
                letter: "A",
                text: "慧眼識珠",
                comment: "慧眼是真的，你值得被看見也是真的。"
            },
            {
                letter: "B",
                text: "眼光獨到",
                comment: "眼光是一回事，主要還是這顆珠子確實夠亮。"
            },
            {
                letter: "C",
                text: "審美卓越",
                comment: "你能穩穩待在審美區五年，這含金量可以。"
            },
            {
                letter: "D",
                text: "長情專一",
                comment: "這麼久還能讓人覺得值得，你才是關鍵。"
            }
        ]
    },

    {
        title: "支持 Sans 久了，最容易出現什麼後遺症？",

        options: [
            {
                letter: "A",
                text: "聽別人的歌開始變挑",
                comment: "的確對好聲音的要求越來越高。"
            },
            {
                letter: "B",
                text: "同一首歌下意識會想「Sans 唱應該也好聽」",
                comment: "這個症狀……小李好像特別嚴重。"
            },
            {
                letter: "C",
                text: "歌單莫名越來越長",
                comment: "手機螢幕錄影也越來越多....."
            },
            {
                letter: "D",
                text: "以上皆是，且暫無藥可醫",
                comment: "確診。建議放棄治療，繼續聽。"
            }
        ]
    }
];


/* =========================================================
   問答完成後 NPC 轉場
========================================================= */

const transitionDialogues = [
    {
        text: "呼——",
        image: "assets/images/NPC_relief.png"
    },

    {
        text: "五個問題，全部完成。",
        image: "assets/images/NPC_relief.png"
    },

    {
        text: "這下總算可以送生日祝福了吧。",
        image: "assets/images/NPC_relief.png"
    },

    {
        text: "……",
        image: "assets/images/NPC_reading.png"
    },

    {
        text: "……",
        image: "assets/images/NPC_flipping.png"
    },

    {
        text: "啊不是。",
        image: "assets/images/NPC_shocked.png"
    },


    {
        text: "你家姐姐……",
        image: "assets/images/NPC_look.png"
    },

    {
        text: "真的很能寫欸。",
        image: "assets/images/NPC_awkward.png"
    },

    {
        text: "算了。",
        image: "assets/images/NPC_awkward.png"
    },

    {
        text: "接下來，交給他自己說吧。",
        image: "assets/images/NPC_look.png"
    }
];


/* =========================================================
   正式祝福文字

   text = 顯示文字
   type = title / story
   stay = 文字完全出現後停留多久

   1000 = 1 秒
========================================================= */

const blessingLines = [

    {
        text: "嗨Sans",
        type: "title",
        stay: 2000
    },
    {
        text: "生日快樂。",
        type: "title",
        stay: 2000
    },

    {
        text:
            "認識你這麼久，偶爾回頭想，<br>" +
            "還是會覺得這件事挺奇妙的。",

        type: "story",
        stay: 3000
    },

    {
        text:
            "那麼大的世界，原本毫無交集的兩顆星，<br>" +
            "卻在某個偶然裡，相遇了。",

        type: "story",
        stay: 3200
    },

{
    text:
        "這一路，<br>" +
        "看過你很多不同的樣子。",

    type: "story",
    stay: 2200
},

{
    text:
        "有意氣風發的時候，<br>" +
        "也有懷疑自己的時候。",

    type: "story",
    stay: 2200
},

{
    text:
        "想說的是，",

    type: "story",
    stay: 1500
},

{
    text:
        "找對適合自己的舞台，<br>" +
        "本來就不是件容易的事。",

    type: "story",
    stay: 2200
},

{
    text:
        "還好世界很大，<br>" ,

    type: "story",
    stay: 1500
},

{
    text:
        "總會有新的地方、新的人，<br>" +
        "讓你重新看見自己的光。",

    type: "story",
    stay: 2200
},

{
    text:
        "新的一歲，<br>" ,

    type: "story",
    stay: 1500
},
{
    text:

        "願你能繼續唱喜歡的歌，<br>" +
        "做想做的事，",

    type: "story",
    stay: 2200
},

{
    text:

        "更自信，<br>" +
        "也更強大，",

    type: "story",
    stay: 2200
},

{
    text:

        "也祝福你",

    type: "story",
    stay: 1500
},

{
    text: "__BIRTHDAY_WISH__",

    type: "wish",
    stay: 3500
},

{
    text:

        "如願",

    type: "story",
    stay: 2200
},

];


/* =========================================================
   正式祝福播放速度

   ★ 之後調整節奏主要改這裡

   startDelay
   星空出現後多久開始第一句

   fadeIn
   文字淡入多久

   fadeOut
   文字淡出多久

   betweenLines
   兩句中間空多久
========================================================= */

const blessingTiming = {

    // ★ 星空出現 1.6 秒後開始第一句
    startDelay: 1600,

    // 文字淡入 1.15 秒
    fadeIn: 1150,

    // 文字淡出 0.9 秒
    fadeOut: 900,

    // 兩句之間空白 0.35 秒
    betweenLines: 350

};


/* =========================================================
   開場 DOM
========================================================= */

const npcScene =
    document.getElementById("npc-scene");

const npc =
    document.getElementById("npc");

const dialogBox =
    document.getElementById("dialog-box");

const dialogText =
    document.getElementById("dialog-text");

const nextHint =
    document.getElementById("next-hint");


/* =========================================================
   問卷 DOM
========================================================= */

const questionScene =
    document.getElementById("question-scene");

const questionPaper =
    document.getElementById("question-paper");

const questionNumber =
    document.getElementById("question-number");

const questionTitle =
    document.getElementById("question-title");

const answerOptions =
    document.getElementById("answer-options");

const yesNoArea =
    document.getElementById("yes-no-area");

const yesButton =
    document.getElementById("yes-button");

const noButton =
    document.getElementById("no-button");

const textAnswerArea =
    document.getElementById("text-answer-area");

const wishInput =
    document.getElementById("wish-input");

const submitWishButton =
    document.getElementById("submit-wish-button");

const questionComment =
    document.getElementById("question-comment");

const commentText =
    document.getElementById("comment-text");

const commentNextButton =
    document.getElementById("comment-next-button");

const commentRetryButton =
    document.getElementById("comment-retry-button");


/* =========================================================
   NPC 轉場 DOM
========================================================= */

const transitionScene =
    document.getElementById("transition-scene");

const transitionDialog =
    document.getElementById("transition-dialog");

const transitionDialogText =
    document.getElementById("transition-dialog-text");

const transitionNextHint =
    document.getElementById("transition-next-hint");

const transitionNpc =
    document.getElementById("transition-npc");


/* =========================================================
   正式祝福 DOM
========================================================= */

const blessingScene =
    document.getElementById("blessing-scene");

const blessingOpening =
    document.getElementById("blessing-opening");

const blessingOpeningText =
    document.getElementById("blessing-opening-text");


/* =========================================================
   開場狀態
========================================================= */

let currentDialogue = 0;

let isTyping = false;

let typingTimer = null;


/* =========================================================
   問卷狀態
========================================================= */

let currentQuestion = 0;

let isQuestionTransitioning = false;

const questionAnswers = {};

let birthdayWish = "";

let commentNextAction = null;

let commentRetryAction = null;


/* =========================================================
   NPC 轉場狀態
========================================================= */

let currentTransitionDialogue = 0;

let isTransitionTyping = false;

let transitionTypingTimer = null;

let isTransitionChangingImage = false;

let transitionFinished = false;


/* =========================================================
   正式祝福狀態
========================================================= */

let blessingSequenceStarted = false;


/* =========================================================
   星空狀態
========================================================= */

let starFieldCreated = false;


/* =========================================================
   建立隨機星空

   ★ 真隨機位置，不使用固定平鋪
   ★ 小星只有部分會閃
   ★ 每顆閃爍速度、延遲都不同
   ★ 亮星數量少，而且不會爆亮
========================================================= */

function createStarField() {

    if (starFieldCreated) {
        return;
    }

    starFieldCreated = true;

    const starLayer =
        document.createElement("div");

    starLayer.className =
        "star-field";

    blessingScene.prepend(
        starLayer
    );


    /*
       大量極小遠星
    */

    const tinyStarCount = 135;

    for (
        let i = 0;
        i < tinyStarCount;
        i++
    ) {

        const star =
            document.createElement("span");

        star.className =
            "star star-tiny";

        const size =
            0.65 + Math.random() * 1.25;

        const opacity =
            0.18 + Math.random() * 0.42;

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;

        star.style.width =
            `${size.toFixed(2)}px`;

        star.style.height =
            `${size.toFixed(2)}px`;

        star.style.setProperty(
            "--base-opacity",
            opacity.toFixed(2)
        );


        /*
           約 38% 的小星會閃
        */

        if (
            Math.random() < 0.38
        ) {

            star.classList.add(
                "star-twinkle"
            );

            const duration =
                1.8 + Math.random() * 2.4;

            const delay =
                -(Math.random() * 4);

            star.style.animationDuration =
                `${duration.toFixed(2)}s`;

            star.style.animationDelay =
                `${delay.toFixed(2)}s`;

        }

        starLayer.appendChild(
            star
        );

    }


    /*
       中等亮星
    */

    const mediumStarCount = 22;

    for (
        let i = 0;
        i < mediumStarCount;
        i++
    ) {

        const star =
            document.createElement("span");

        star.className =
            "star star-medium";

        const size =
            1.5 + Math.random() * 1.5;

        const duration =
            2.2 + Math.random() * 3.2;

        const delay =
            -(Math.random() * 5);

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;

        star.style.width =
            `${size.toFixed(2)}px`;

        star.style.height =
            `${size.toFixed(2)}px`;

        star.style.animationDuration =
            `${duration.toFixed(2)}s`;

        star.style.animationDelay =
            `${delay.toFixed(2)}s`;

        starLayer.appendChild(
            star
        );

    }


    /*
       極少量亮星
    */

    const brightStarCount = 6;

    for (
        let i = 0;
        i < brightStarCount;
        i++
    ) {

        const star =
            document.createElement("span");

        star.className =
            "star star-bright";

        const size =
            2.2 + Math.random() * 1.6;

        const duration =
            3.2 + Math.random() * 3.6;

        const delay =
            -(Math.random() * 6);

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;

        star.style.width =
            `${size.toFixed(2)}px`;

        star.style.height =
            `${size.toFixed(2)}px`;

        star.style.animationDuration =
            `${duration.toFixed(2)}s`;

        star.style.animationDelay =
            `${delay.toFixed(2)}s`;

        starLayer.appendChild(
            star
        );

    }

}


/* =========================================================
   最終煙火篇

   流程：
   1. 「如願」淡出
   2. 先播放一小段一般煙火（時間可調）
   3. SANS 先出現
   4. HAPPY BIRTHDAY 再出現（與 SANS 同頁、置中）
   5. JUST DO IT
   6. YOU'RE THE BEST
   7. 祝你有個美好的一天
   8. 最後煙火高潮收尾

   ★ 不需要修改 index.html
   ★ 不需要修改 style.css
========================================================= */

/*
   ★ 煙火篇時間設定

   introFireworksDuration
   = 前面純煙火播放多久後開始進入文字
   1000 = 1 秒

   birthdaySecondLineDelay
   = SANS 出現後，多久再出現 HAPPY BIRTHDAY
*/
const fireworksTiming = {

    /*
       ★ 第三段進場卡點

       finalFinalDelay
       = 星空完全進入黑屏後，
         等多久才顯示「最後最後........」

       finalFinalStay
       = 「最後最後........」完整顯示多久

       finalFinalFade
       = 文字淡入 / 淡出速度
    */
    finalFinalDelay: 500,
    finalFinalStay: 1800,
    finalFinalFade: 260,

    /*
       ★ HBD 音樂提前進場時間

       =「最後最後........」完整顯示的停留時間結束前，
         提前多久開始播放 HBD。

       300 = 提前 0.3 秒
       500 = 提前 0.5 秒

       ★ 只控制 HBD 音樂，不控制煙火。
    */
    hbdEarlyStart: 500,

    /*
       ★「最後最後........」完全消失後，
         再維持純黑畫面多久才開始煙火。

       ★ 這個現在只控制煙火進場，
         HBD 已經會在上面提前播放。
    */
    finalFinalAfterDelay: 1000,

    /*
       ★「如願」淡出後，真正全黑停留多久
       1000 = 1 秒
       想黑屏更久，只改這個數字。
    */
    blackScreenDuration: 2000,

    /*
       ★ 黑幕淡入 / 淡出的速度
    */
    blackFadeDuration: 650,

    /*
       ★ 黑幕退掉後，多久開始文字段背景煙火
    */
    transitionDelay: 350,

    /*
       ★ 前面純煙火播放多久後開始 SANS
    */
    introFireworksDuration: 1600,

    /*
       ★ SANS 出現後，多久再出現 HAPPY BIRTHDAY
    */
    birthdaySecondLineDelay: 1200,

    /*
       ★ HAPPY BIRTHDAY 出現後，
         SANS + HAPPY BIRTHDAY 一起停留多久
    */
    birthdayTitleStay: 2400,

    /*
       ★ 每一段文字各自停留時間
       1000 = 1 秒
    */
    justDoItStay: 2400,
    bestStay: 2600,
    finalWishStay: 3200,

    /*
       ★ 文字段背景煙火的發射間隔
       數字越小 = 越密
       目前 900ms 一發，讓文字出現期間煙火持續播放
    */
    textFireworkInterval: 1150,

    /*
       ★ 最後完整煙火秀時間
    */
    finaleDuration: 30000

};


async function playBlackScreenTransition() {

    const blackScreen =
        document.createElement("div");

    blackScreen.style.position =
        "absolute";

    blackScreen.style.inset =
        "0";

    blackScreen.style.zIndex =
        "999";

    blackScreen.style.pointerEvents =
        "none";

    blackScreen.style.background =
        "#000";

    blackScreen.style.opacity =
        "0";

    blackScreen.style.transition =
        `opacity ${fireworksTiming.blackFadeDuration}ms ease`;

    blessingScene.appendChild(
        blackScreen
    );


    /*
       星空 → 全黑
    */

    await wait(40);

    blackScreen.style.opacity =
        "1";

    await wait(
        fireworksTiming.blackFadeDuration
    );


    /*
       ★ 第二段「幾分之幾」到這裡正式收尾。
       在黑屏期間淡出。
    */

    fadeOutBlessingBgm(900);


    /*
       =====================================================
       ★ 第三段進場

       全黑後先停 0.5 秒，
       再顯示「最後最後........」
    =====================================================
    */

    await wait(
        fireworksTiming.finalFinalDelay
    );


    const finalFinalText =
        document.createElement("div");

    finalFinalText.textContent =
        "最後最後........";

    finalFinalText.style.position =
        "absolute";

    finalFinalText.style.left =
        "50%";

    finalFinalText.style.top =
        "50%";

    finalFinalText.style.transform =
        "translate(-50%, -50%)";

    finalFinalText.style.zIndex =
        "1000";

    finalFinalText.style.width =
        "90%";

    finalFinalText.style.textAlign =
        "center";

    finalFinalText.style.fontFamily =
        '"Microsoft JhengHei", sans-serif';

    finalFinalText.style.fontSize =
        "clamp(24px, 3.5vw, 42px)";

    finalFinalText.style.fontWeight =
        "400";

    finalFinalText.style.letterSpacing =
        "0.08em";

    finalFinalText.style.color =
        "rgba(255,255,255,.94)";

    finalFinalText.style.textShadow =
        "0 0 18px rgba(255,255,255,.12)";

    finalFinalText.style.opacity =
        "0";

    finalFinalText.style.transition =
        `opacity ${fireworksTiming.finalFinalFade}ms ease`;

    blackScreen.appendChild(
        finalFinalText
    );


    await wait(30);

    finalFinalText.style.opacity =
        "1";


    /*
       ★「最後最後........」停留期間：
         HBD 會在結束前 hbdEarlyStart 毫秒先開始。

         例如：
         finalFinalStay = 1500
         hbdEarlyStart = 500

         → 文字完整顯示 1.0 秒後 HBD 開始
         → 再過 0.5 秒文字開始淡出
    */

    const hbdEarlyStart =
        Math.min(
            fireworksTiming.hbdEarlyStart,
            fireworksTiming.finalFinalStay
        );

    await wait(
        fireworksTiming.finalFinalStay -
        hbdEarlyStart
    );

    startFireworksBgm();

    await wait(
        hbdEarlyStart
    );


    /*
       文字淡出
    */

    finalFinalText.style.opacity =
        "0";

    await wait(
        fireworksTiming.finalFinalFade
    );

    finalFinalText.remove();


    /*
       ★「最後最後........」消失後，
         再保持純黑畫面一段可調整的時間，
         然後才開始煙火。
    */

    await wait(
        fireworksTiming.finalFinalAfterDelay
    );


    /*
       =====================================================
       ★ 煙火進場

       HBD 已經在「最後最後........」結束前提前播放。
       這裡只負責開始煙火。
    =====================================================
    */

    startFinalFireworks();


    /*
       黑幕稍停一下，
       讓煙火 Canvas 已經準備好，
       再把黑幕退掉。
    */

    await wait(120);

    blackScreen.style.opacity =
        "0";

    await wait(
        fireworksTiming.blackFadeDuration
    );

    blackScreen.remove();

}


let fireworksStarted = false;


async function startFinalFireworks() {

    /*
       ★ 煙火正式開始時切成全畫面純黑
       不修改任何 NPC / 對話框定位。
    */

    document.body.classList.add(
        "fireworks-mode"
    );

    blessingScene.style.background =
        "#000";

    const starField =
        blessingScene.querySelector(
            ".star-field"
        );

    if (starField) {

        starField.style.opacity =
            "0";

        starField.style.visibility =
            "hidden";

    }


    if (fireworksStarted) {
        return;
    }

    fireworksStarted = true;


    /* =====================================================
       1. 建立 Canvas
    ===================================================== */

    const canvas =
        document.createElement("canvas");

    canvas.style.position =
        "absolute";

    canvas.style.inset =
        "0";

    canvas.style.width =
        "100%";

    canvas.style.height =
        "100%";

    /* ★ 煙火 Canvas 本身使用純黑背景 */
    canvas.style.background =
        "#000";

    canvas.style.zIndex =
        "4";

    canvas.style.pointerEvents =
        "none";

    canvas.style.opacity =
        "0";

    canvas.style.transition =
        "opacity 1.8s ease";

    blessingScene.appendChild(
        canvas
    );


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            canvas.style.opacity =
                "1";

        });

    });


    /* =====================================================
       2. 星空 → 煙火柔和過場
    ===================================================== */

    const fireworksTransitionOverlay =
        document.createElement("div");

    fireworksTransitionOverlay.style.position =
        "absolute";

    fireworksTransitionOverlay.style.inset =
        "0";

    fireworksTransitionOverlay.style.zIndex =
        "3";

    fireworksTransitionOverlay.style.pointerEvents =
        "none";

    fireworksTransitionOverlay.style.background =
        "rgba(5, 6, 16, 0)";

    fireworksTransitionOverlay.style.transition =
        "background 2s ease";

    blessingScene.appendChild(
        fireworksTransitionOverlay
    );


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            fireworksTransitionOverlay.style.background =
                "rgba(5, 6, 16, 0.18)";

        });

    });


    const ctx =
        canvas.getContext("2d");


    function resizeCanvas() {

        const ratio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        canvas.width =
            Math.floor(
                blessingScene.clientWidth *
                ratio
            );

        canvas.height =
            Math.floor(
                blessingScene.clientHeight *
                ratio
            );

        ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );

    }


    resizeCanvas();

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    const rockets = [];
    const particles = [];
    const smokeClouds = [];
    const flashes = [];


    const width = () =>
        blessingScene.clientWidth;

    const height = () =>
        blessingScene.clientHeight;


    /*
       ★ 顏色刻意不做滿版彩虹。
         主體是金色 / 白金 / 暖色，
         偶爾穿插一點冷色。
    */

    const fireworkPalette = [
        42,   // 金
        48,   // 淡金
        38,   // 暖金
        28,   // 琥珀
        12,   // 暖橘紅
        350,  // 柔紅
        205,  // 淡藍
        225   // 藍紫
    ];


    function randomHue(
        warmBias = true
    ) {

        if (
            warmBias &&
            Math.random() < 0.78
        ) {

            return fireworkPalette[
                Math.floor(
                    Math.random() * 6
                )
            ];

        }

        return fireworkPalette[
            Math.floor(
                Math.random() *
                fireworkPalette.length
            )
        ];

    }


    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );

    }


    /* =====================================================
       3. 光暈與煙霧
    ===================================================== */

    function createFlash(
        x,
        y,
        hue,
        radius = 95,
        alpha = 0.34
    ) {

        flashes.push({
            x,
            y,
            hue,
            radius,
            alpha,
            decay:
                0.045 +
                Math.random() * 0.025
        });

    }


    function createSmoke(
        x,
        y,
        hue,
        amount = 4
    ) {

        for (
            let i = 0;
            i < amount;
            i++
        ) {

            smokeClouds.push({

                x:
                    x +
                    (
                        Math.random() * 26 -
                        13
                    ),

                y:
                    y +
                    (
                        Math.random() * 18 -
                        9
                    ),

                vx:
                    Math.random() * 0.25 -
                    0.125,

                vy:
                    -0.08 -
                    Math.random() * 0.16,

                radius:
                    22 +
                    Math.random() * 36,

                alpha:
                    0.045 +
                    Math.random() * 0.045,

                hue,

                life:
                    1,

                decay:
                    0.003 +
                    Math.random() * 0.002

            });

        }

    }


    /* =====================================================
       4. 粒子建立工具
    ===================================================== */

    function addParticle({
        x,
        y,
        vx,
        vy,
        hue,
        saturation = 96,
        lightness = 78,
        size = 1.75,
        alpha = 1,
        decay = 0.011,
        gravity = 0.04,
        friction = 0.986,
        trail = true,
        sparkle = false
    }) {

        particles.push({

            x,
            y,

            oldX: x,
            oldY: y,

            vx,
            vy,

            hue,
            saturation,
            lightness,

            size,
            alpha,
            decay,

            gravity,
            friction,

            trail,
            sparkle,

            twinkle:
                Math.random() * Math.PI * 2

        });

    }


    /* =====================================================
       5. 各種煙火爆炸
    ===================================================== */

    function explodeChrysanthemum(
        x,
        y,
        hue,
        strength = 1
    ) {

        const count =
            Math.floor(
                (
                    72 +
                    Math.random() * 24
                ) *
                strength
            );

        const offset =
            Math.random() *
            Math.PI *
            2;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                offset +
                (
                    i /
                    count
                ) *
                Math.PI *
                2 +
                (
                    Math.random() - 0.5
                ) *
                0.08;

            const speed =
                (
                    2.2 +
                    Math.random() * 4.8
                ) *
                Math.min(
                    strength,
                    1.3
                );

            addParticle({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                hue:
                    hue +
                    (
                        Math.random() * 12 -
                        6
                    ),

                size:
                    1.55 +
                    Math.random() * 1.45,

                decay:
                    0.009 +
                    Math.random() * 0.008,

                gravity:
                    0.034 +
                    Math.random() * 0.025,

                sparkle:
                    Math.random() < 0.28

            });

        }

        createFlash(
            x,
            y,
            hue,
            115 * strength,
            0.34
        );

        createSmoke(
            x,
            y,
            hue,
            4
        );

    }


    function explodeWillow(
        x,
        y,
        hue = 42,
        strength = 1
    ) {

        const count =
            Math.floor(
                (
                    80 +
                    Math.random() * 24
                ) *
                strength
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                (
                    2.0 +
                    Math.random() * 3.8
                ) *
                Math.min(
                    strength,
                    1.25
                );

            addParticle({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed *
                    0.92,

                hue:
                    hue +
                    (
                        Math.random() * 8 -
                        4
                    ),

                saturation:
                    82,

                lightness:
                    80,

                size:
                    1.75 +
                    Math.random() * 1.55,

                decay:
                    0.0048 +
                    Math.random() * 0.0045,

                gravity:
                    0.058 +
                    Math.random() * 0.025,

                friction:
                    0.991,

                sparkle: true

            });

        }

        createFlash(
            x,
            y,
            hue,
            135 * strength,
            0.38
        );

        createSmoke(
            x,
            y,
            hue,
            6
        );

    }


    function explodeRing(
        x,
        y,
        hue,
        strength = 1
    ) {

        const count =
            Math.floor(
                58 *
                strength
            );

        const rotation =
            Math.random() *
            Math.PI *
            2;

        const baseSpeed =
            (
                3.2 +
                Math.random() * 1.6
            ) *
            Math.min(
                strength,
                1.25
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                rotation +
                (
                    i /
                    count
                ) *
                Math.PI *
                2;

            const speed =
                baseSpeed *
                (
                    0.94 +
                    Math.random() * 0.12
                );

            addParticle({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                hue,

                size:
                    1.65 +
                    Math.random() * 1.15,

                decay:
                    0.008 +
                    Math.random() * 0.006,

                gravity: 0.03,

                sparkle:
                    Math.random() < 0.35

            });

        }

        createFlash(
            x,
            y,
            hue,
            105 * strength,
            0.32
        );

        createSmoke(
            x,
            y,
            hue,
            3
        );

    }


    function explodeDouble(
        x,
        y,
        hue,
        strength = 1
    ) {

        const secondHue =
            (
                hue +
                (
                    Math.random() < 0.5
                        ? 38
                        : 178
                )
            ) %
            360;

        const outerCount =
            Math.floor(
                58 *
                strength
            );

        for (
            let i = 0;
            i < outerCount;
            i++
        ) {

            const angle =
                (
                    i /
                    outerCount
                ) *
                Math.PI *
                2 +
                (
                    Math.random() - 0.5
                ) *
                0.04;

            const speed =
                (
                    4.2 +
                    Math.random() * 1.5
                ) *
                Math.min(
                    strength,
                    1.25
                );

            addParticle({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                hue,

                size:
                    1.6 +
                    Math.random() * 1.25,

                decay:
                    0.009 +
                    Math.random() * 0.006,

                gravity: 0.035,

                sparkle: true

            });

        }


        const innerCount =
            Math.floor(
                42 *
                strength
            );

        for (
            let i = 0;
            i < innerCount;
            i++
        ) {

            const angle =
                (
                    i /
                    innerCount
                ) *
                Math.PI *
                2;

            const speed =
                (
                    2.0 +
                    Math.random() * 0.9
                ) *
                Math.min(
                    strength,
                    1.25
                );

            addParticle({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                hue: secondHue,

                lightness: 84,

                size:
                    1.7 +
                    Math.random() * 1.25,

                decay:
                    0.010 +
                    Math.random() * 0.006,

                gravity: 0.03,

                sparkle: true

            });

        }

        createFlash(
            x,
            y,
            hue,
            130 * strength,
            0.4
        );

        createSmoke(
            x,
            y,
            hue,
            5
        );

    }


    function explodePeony(
        x,
        y,
        hue,
        strength = 1
    ) {

        const count =
            Math.floor(
                (
                    52 +
                    Math.random() * 18
                ) *
                strength
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                (
                    1.4 +
                    Math.random() * 5.2
                ) *
                Math.min(
                    strength,
                    1.25
                );

            addParticle({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                hue:
                    hue +
                    (
                        Math.random() * 18 -
                        9
                    ),

                size:
                    1.55 +
                    Math.random() * 1.4,

                decay:
                    0.012 +
                    Math.random() * 0.008,

                gravity:
                    0.042 +
                    Math.random() * 0.026,

                sparkle:
                    Math.random() < 0.18

            });

        }

        createFlash(
            x,
            y,
            hue,
            95 * strength,
            0.3
        );

        createSmoke(
            x,
            y,
            hue,
            3
        );

    }


    /*
       ★ 前段文字專用：長流蘇煙火
       比一般 willow：
       - 消失更慢
       - 重力稍強
       - 尾巴會垂得更下面才淡掉
       只用在前面文字煙火，不影響最後 Finale。
    */

    function explodeTextWillow(
        x,
        y,
        hue = 42,
        strength = 1
    ) {

        const count =
            Math.floor(
                (
                    78 +
                    Math.random() * 22
                ) *
                strength
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                (
                    1.9 +
                    Math.random() * 3.5
                ) *
                Math.min(
                    strength,
                    1.22
                );

            addParticle({

                x,
                y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed *
                    0.86,

                hue:
                    hue +
                    (
                        Math.random() * 7 -
                        3.5
                    ),

                saturation: 80,
                lightness: 82,

                size:
                    1.75 +
                    Math.random() * 1.5,

                /*
                   ★ decay 比一般 willow 更低
                     → 活得更久
                */
                decay:
                    0.0030 +
                    Math.random() * 0.0030,

                /*
                   ★ 重力稍強
                     → 流蘇會真正往下垂
                */
                gravity:
                    0.070 +
                    Math.random() * 0.026,

                friction:
                    0.992,

                sparkle: true

            });

        }


        createFlash(
            x,
            y,
            hue,
            110 * strength,
            0.24
        );

        createSmoke(
            x,
            y,
            hue,
            3
        );

    }


    function explodeByType(
        type,
        x,
        y,
        hue,
        strength = 1
    ) {

        switch (type) {

            case "textWillow":

                explodeTextWillow(
                    x,
                    y,
                    hue,
                    strength
                );

                break;


            case "willow":

                explodeWillow(
                    x,
                    y,
                    hue,
                    strength
                );

                break;


            case "ring":

                explodeRing(
                    x,
                    y,
                    hue,
                    strength
                );

                break;


            case "double":

                explodeDouble(
                    x,
                    y,
                    hue,
                    strength
                );

                break;


            case "peony":

                explodePeony(
                    x,
                    y,
                    hue,
                    strength
                );

                break;


            default:

                explodeChrysanthemum(
                    x,
                    y,
                    hue,
                    strength
                );

                break;

        }

    }


    /* =====================================================
       6. 發射火箭
    ===================================================== */

    function launchRocket({
        x = null,
        y = null,
        type = null,
        hue = null,
        strength = 1,
        speed = null
    } = {}) {

        const targetX =
            x ??
            width() *
            (
                0.12 +
                Math.random() * 0.76
            );

        const targetY =
            y ??
            height() *
            (
                0.10 +
                Math.random() * 0.46
            );

        const chosenTypes = [
            "chrysanthemum",
            "peony",
            "ring",
            "double"
        ];

        const chosenType =
            type ??
            chosenTypes[
                Math.floor(
                    Math.random() *
                    chosenTypes.length
                )
            ];

        const chosenHue =
            hue ??
            randomHue();

        rockets.push({

            x:
                clamp(
                    targetX +
                    width() *
                    (
                        Math.random() * 0.06 -
                        0.03
                    ),
                    width() * 0.06,
                    width() * 0.94
                ),

            y:
                height() + 14,

            targetX,
            targetY,

            speed:
                speed ??
                (
                    5.0 +
                    Math.random() * 1.35
                ),

            hue:
                chosenHue,

            type:
                chosenType,

            strength,

            trail: []

        });

    }


    function launchPair(
        type = null,
        strength = 1
    ) {

        const y =
            height() *
            (
                0.16 +
                Math.random() * 0.28
            );

        launchRocket({
            x:
                width() *
                (
                    0.25 +
                    Math.random() * 0.12
                ),
            y,
            type,
            strength
        });

        launchRocket({
            x:
                width() *
                (
                    0.63 +
                    Math.random() * 0.12
                ),
            y:
                y +
                (
                    Math.random() * 50 -
                    25
                ),
            type,
            strength
        });

    }


    /* =====================================================
       7. Canvas 動畫
    ===================================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );


        /*
           淡淡蓋上一層深色。
           alpha 越低，煙火尾跡越長。
        */

        ctx.fillStyle =
            "rgba(6, 7, 18, 0.13)";

        ctx.fillRect(
            0,
            0,
            width(),
            height()
        );


        /* ---------------- 光暈 ---------------- */

        for (
            let i =
                flashes.length - 1;
            i >= 0;
            i--
        ) {

            const flash =
                flashes[i];

            flash.alpha -=
                flash.decay;

            flash.radius *=
                1.035;

            if (
                flash.alpha <= 0
            ) {

                flashes.splice(
                    i,
                    1
                );

                continue;

            }

            const gradient =
                ctx.createRadialGradient(
                    flash.x,
                    flash.y,
                    0,
                    flash.x,
                    flash.y,
                    flash.radius
                );

            gradient.addColorStop(
                0,
                `hsla(${flash.hue},100%,92%,${flash.alpha})`
            );

            gradient.addColorStop(
                0.28,
                `hsla(${flash.hue},100%,76%,${flash.alpha * 0.34})`
            );

            gradient.addColorStop(
                1,
                `hsla(${flash.hue},100%,60%,0)`
            );

            ctx.fillStyle =
                gradient;

            ctx.beginPath();

            ctx.arc(
                flash.x,
                flash.y,
                flash.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }


        /* ---------------- 煙霧 ---------------- */

        for (
            let i =
                smokeClouds.length - 1;
            i >= 0;
            i--
        ) {

            const smoke =
                smokeClouds[i];

            smoke.x +=
                smoke.vx;

            smoke.y +=
                smoke.vy;

            smoke.radius +=
                0.08;

            smoke.life -=
                smoke.decay;

            if (
                smoke.life <= 0
            ) {

                smokeClouds.splice(
                    i,
                    1
                );

                continue;

            }

            const alpha =
                smoke.alpha *
                smoke.life;

            const gradient =
                ctx.createRadialGradient(
                    smoke.x,
                    smoke.y,
                    0,
                    smoke.x,
                    smoke.y,
                    smoke.radius
                );

            gradient.addColorStop(
                0,
                `hsla(${smoke.hue},22%,78%,${alpha})`
            );

            gradient.addColorStop(
                1,
                `hsla(${smoke.hue},22%,45%,0)`
            );

            ctx.fillStyle =
                gradient;

            ctx.beginPath();

            ctx.arc(
                smoke.x,
                smoke.y,
                smoke.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }


        /* ---------------- 火箭升空 ---------------- */

        for (
            let i =
                rockets.length - 1;
            i >= 0;
            i--
        ) {

            const rocket =
                rockets[i];


            rocket.trail.push({
                x: rocket.x,
                y: rocket.y
            });


            if (
                rocket.trail.length > 13
            ) {

                rocket.trail.shift();

            }


            const dx =
                rocket.targetX -
                rocket.x;

            const dy =
                rocket.targetY -
                rocket.y;

            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            if (
                distance <
                rocket.speed
            ) {

                explodeByType(
                    rocket.type,
                    rocket.targetX,
                    rocket.targetY,
                    rocket.hue,
                    rocket.strength
                );

                rockets.splice(
                    i,
                    1
                );

                continue;

            }


            rocket.x +=
                dx /
                distance *
                rocket.speed;

            rocket.y +=
                dy /
                distance *
                rocket.speed;


            for (
                let t = 1;
                t < rocket.trail.length;
                t++
            ) {

                const previous =
                    rocket.trail[t - 1];

                const current =
                    rocket.trail[t];

                const alpha =
                    (
                        t /
                        rocket.trail.length
                    ) *
                    0.62;

                ctx.beginPath();

                ctx.moveTo(
                    previous.x,
                    previous.y
                );

                ctx.lineTo(
                    current.x,
                    current.y
                );

                ctx.lineWidth =
                    0.8 +
                    alpha *
                    1.6;

                ctx.strokeStyle =
                    `hsla(${rocket.hue},100%,84%,${alpha})`;

                ctx.stroke();

            }


            ctx.beginPath();

            ctx.arc(
                rocket.x,
                rocket.y,
                2.25,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `hsl(${rocket.hue},100%,92%)`;

            ctx.fill();

        }


        /* ---------------- 爆炸粒子 ---------------- */

        ctx.lineCap =
            "round";

        for (
            let i =
                particles.length - 1;
            i >= 0;
            i--
        ) {

            const p =
                particles[i];

            p.oldX =
                p.x;

            p.oldY =
                p.y;

            p.vx *=
                p.friction;

            p.vy *=
                p.friction;

            p.vy +=
                p.gravity;

            p.x +=
                p.vx;

            p.y +=
                p.vy;

            p.alpha -=
                p.decay;

            p.twinkle +=
                0.22;


            if (
                p.alpha <= 0
            ) {

                particles.splice(
                    i,
                    1
                );

                continue;

            }


            const sparkleFactor =
                p.sparkle
                    ? (
                        0.72 +
                        Math.sin(
                            p.twinkle
                        ) *
                        0.28
                    )
                    : 1;


            /*
               粒子柔光
            */

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size * 4.8,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `hsla(${p.hue},${p.saturation}%,${p.lightness}%,${p.alpha * 0.08})`;

            ctx.fill();


            /*
               粒子拖尾
            */

            if (
                p.trail
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    p.oldX,
                    p.oldY
                );

                ctx.lineTo(
                    p.x,
                    p.y
                );

                ctx.lineWidth =
                    Math.max(
                        1.1,
                        p.size * 1.25
                    );

                ctx.strokeStyle =
                    `hsla(${p.hue},${p.saturation}%,${p.lightness}%,${p.alpha * 0.82 * sparkleFactor})`;

                ctx.stroke();

            }


            /*
               粒子核心
            */

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `hsla(${p.hue},${p.saturation}%,${Math.min(96, p.lightness + 8)}%,${p.alpha * sparkleFactor})`;

            ctx.fill();

        }

    }


    requestAnimationFrame(
        animate
    );


    /* =====================================================
       7-1. 文字段背景煙火控制

       ★ 重要：
         SANS / HAPPY BIRTHDAY / JUST DO IT /
         YOU'RE THE BEST / 最後中文祝福出現時，
         背景煙火都會持續播放，不會停住。

         這裡只使用較單純的煙火，
         不會提前用到最後 Finale 的豪華齊放。
    ===================================================== */

    let textFireworksRunning =
        false;

    let textFireworksTimer =
        null;


    /*
       ★ 第一段「文字煙火」專用華麗煙火

       目標不是把爆炸範圍放超大，
       而是讓一朵煙火本身更有層次：
       - 主花
       - 稍晚一點的第二層
       - 偶爾左右搭配
       - 金 / 白金為主，少量冷色
       - 保持文字可讀性

       這一組只給前面的文字煙火使用，
       不會改到最後 30 秒 Finale。
    */

    async function launchLayeredTextFirework() {

        const roll =
            Math.random();

        const mainX =
            width() *
            (
                0.24 +
                Math.random() * 0.52
            );

        const mainY =
            height() *
            (
                0.16 +
                Math.random() * 0.20
            );


        /*
           約一半：中央大型雙層花
        */

        if (roll < 0.50) {

            launchRocket({
                x: mainX,
                y: mainY,
                type: "double",
                hue:
                    Math.random() < 0.82
                        ? 45
                        : 205,
                strength:
                    0.96 +
                    Math.random() * 0.08
            });

            await wait(
                180 +
                Math.random() * 100
            );

            /*
               第二層稍微錯位，
               讓畫面不是只有一圈炸開。
            */

            launchRocket({
                x:
                    mainX +
                    (
                        Math.random() - 0.5
                    ) *
                    width() * 0.12,
                y:
                    mainY +
                    height() * 0.07,
                type:
                    Math.random() < 0.55
                        ? "ring"
                        : "chrysanthemum",
                hue:
                    Math.random() < 0.78
                        ? 48
                        : 205,
                strength: 0.82
            });

            return;

        }


        /*
           約 30%：金色垂柳 + 小型補花
        */

        if (roll < 0.80) {

            launchRocket({
                x: mainX,
                y: mainY,
                type: "textWillow",
                hue: 42,
                strength:
                    1.00 +
                    Math.random() * 0.06
            });

            await wait(
                240 +
                Math.random() * 100
            );

            launchRocket({
                x:
                    mainX <
                    width() * 0.5
                        ? width() * 0.70
                        : width() * 0.30,
                y:
                    height() *
                    (
                        0.28 +
                        Math.random() * 0.10
                    ),
                type:
                    Math.random() < 0.5
                        ? "ring"
                        : "peony",
                hue: 48,
                strength: 0.78
            });

            return;

        }


        /*
           約 20%：左右兩朵交錯綻放
        */

        launchRocket({
            x: width() * 0.27,
            y:
                height() *
                (
                    0.20 +
                    Math.random() * 0.10
                ),
            type: "chrysanthemum",
            hue: 45,
            strength: 0.88
        });

        await wait(150);

        launchRocket({
            x: width() * 0.73,
            y:
                height() *
                (
                    0.18 +
                    Math.random() * 0.10
                ),
            type:
                Math.random() < 0.55
                    ? "double"
                    : "ring",
            hue:
                Math.random() < 0.75
                    ? 48
                    : 205,
            strength: 0.88
        });

    }


    function launchTextBackgroundFirework() {

        /*
           文字段改用「多層華麗煙火」。
           不 await，讓背景煙火可以自然交疊，
           但 interval 仍控制整體密度。
        */

        launchLayeredTextFirework();

    }


    function startTextBackgroundFireworks() {

        if (
            textFireworksRunning
        ) {
            return;
        }

        textFireworksRunning =
            true;


        /*
           先立刻放一發，
           不要等第一個 interval 才有煙火。
        */

        launchTextBackgroundFirework();


        textFireworksTimer =
            setInterval(
                () => {

                    if (
                        !textFireworksRunning
                    ) {
                        return;
                    }

                    launchTextBackgroundFirework();

                },
                fireworksTiming.textFireworkInterval
            );

    }


    function stopTextBackgroundFireworks() {

        textFireworksRunning =
            false;

        if (
            textFireworksTimer
        ) {

            clearInterval(
                textFireworksTimer
            );

            textFireworksTimer =
                null;

        }

    }


    /* =====================================================
       8. 建立煙火文字
    ===================================================== */

    const fireworkText =
        document.createElement("div");

    fireworkText.style.position =
        "absolute";

    fireworkText.style.left =
        "50%";

    fireworkText.style.top =
        "50%";

    fireworkText.style.transform =
        "translate(-50%, -50%) scale(0.94)";

    fireworkText.style.zIndex =
        "6";

    fireworkText.style.width =
        "92%";

    fireworkText.style.display =
        "flex";

    fireworkText.style.flexDirection =
        "column";

    fireworkText.style.alignItems =
        "center";

    fireworkText.style.justifyContent =
        "center";

    fireworkText.style.textAlign =
        "center";

    fireworkText.style.whiteSpace =
        "normal";

    fireworkText.style.lineHeight =
        "1.35";

    fireworkText.style.pointerEvents =
        "none";

    fireworkText.style.opacity =
        "0";

    fireworkText.style.fontFamily =
        '"Microsoft JhengHei", sans-serif';

    fireworkText.style.fontWeight =
        "700";

    fireworkText.style.letterSpacing =
        "0.10em";

    fireworkText.style.color =
        "rgba(255,255,255,0.98)";

    fireworkText.style.textShadow =
        "0 0 8px rgba(255,255,255,.9), " +
        "0 0 24px rgba(190,200,255,.55), " +
        "0 0 48px rgba(160,175,255,.28)";

    fireworkText.style.transition =
        "opacity 1.05s ease, " +
        "transform 1.05s cubic-bezier(.22,.61,.36,1), " +
        "filter 1.05s ease";

    blessingScene.appendChild(
        fireworkText
    );


    async function showFireworkText(
        text,
        size,
        stayTime
    ) {

        /*
           背景煙火由 startTextBackgroundFireworks()
           持續播放，所以這裡只負責文字本身。
        */

        fireworkText.textContent =
            text;

        fireworkText.style.fontSize =
            size;

        fireworkText.style.opacity =
            "0";

        fireworkText.style.transform =
            "translate(-50%, calc(-50% + 12px)) scale(0.94)";

        fireworkText.style.filter =
            "blur(8px)";


        await wait(40);


        fireworkText.style.opacity =
            "1";

        fireworkText.style.transform =
            "translate(-50%, -50%) scale(1)";

        fireworkText.style.filter =
            "blur(0px)";


        await wait(
            stayTime
        );


        fireworkText.style.opacity =
            "0";

        fireworkText.style.transform =
            "translate(-50%, calc(-50% - 8px)) scale(1.03)";

        fireworkText.style.filter =
            "blur(5px)";


        await wait(780);

    }


    /* =====================================================
       9. SANS + HAPPY BIRTHDAY
    ===================================================== */

    async function showBirthdayTitle() {

        /*
           SANS / HAPPY BIRTHDAY 出現期間，
           背景煙火同樣持續播放，不另外停下或切換形式。
        */



        fireworkText.innerHTML = `
            <div style="
                width: 100%;
                text-align: center;
                font-size: clamp(48px, 7vw, 96px);
                line-height: 1.15;
            ">
                SANS
            </div>

            <div
                class="birthday-second-line"
                style="
                    width: 100%;
                    margin-top: 0.18em;
                    text-align: center;
                    font-size: clamp(34px, 5vw, 72px);
                    line-height: 1.2;
                    opacity: 0;
                    transform: translateY(14px) scale(0.96);
                    filter: blur(7px);
                    transition:
                        opacity 1s ease,
                        transform 1s cubic-bezier(.22,.61,.36,1),
                        filter 1s ease;
                "
            >
                HAPPY BIRTHDAY
            </div>
        `;


        fireworkText.style.opacity =
            "0";

        fireworkText.style.transform =
            "translate(-50%, calc(-50% + 12px)) scale(0.94)";

        fireworkText.style.filter =
            "blur(8px)";


        await wait(40);


        fireworkText.style.opacity =
            "1";

        fireworkText.style.transform =
            "translate(-50%, -50%) scale(1)";

        fireworkText.style.filter =
            "blur(0px)";


        await wait(
            fireworksTiming.birthdaySecondLineDelay
        );


        const secondLine =
            fireworkText.querySelector(
                ".birthday-second-line"
            );


        if (secondLine) {

            secondLine.style.opacity =
                "1";

            secondLine.style.transform =
                "translateY(0) scale(1)";

            secondLine.style.filter =
                "blur(0px)";

        }


        await wait(
            fireworksTiming.birthdayTitleStay
        );


        fireworkText.style.opacity =
            "0";

        fireworkText.style.transform =
            "translate(-50%, calc(-50% - 8px)) scale(1.03)";

        fireworkText.style.filter =
            "blur(5px)";


        await wait(800);

        fireworkText.innerHTML =
            "";

    }


    /* =====================================================
       9-1. 最後常駐文字

       ★ 這段文字一出現，就直接進入盛大 Finale。
       ★ Finale 30 秒期間不消失。
    ===================================================== */

    async function showPersistentFinalMessage() {

        fireworkText.innerHTML = `
            <div style="
                width: 100%;
                text-align: center;
                font-size: clamp(50px, 7vw, 96px);
                line-height: 1.05;
                font-weight: 650;
                letter-spacing: 0.12em;
            ">
                SANS
            </div>

            <div style="
                width: 100%;
                margin-top: 0.28em;
                text-align: center;
                font-size: clamp(40px, 5.6vw, 78px);
                line-height: 1.18;
                font-weight: 600;
                letter-spacing: 0.08em;
            ">
                生日快樂
            </div>

            <div style="
                width: 100%;
                margin-top: 0.48em;
                text-align: center;
                font-size: clamp(25px, 3.4vw, 46px);
                line-height: 1.45;
                font-weight: 400;
                letter-spacing: 0.07em;
            ">
                祝你有個美好的一天
            </div>
        `;

        fireworkText.style.opacity =
            "0";

        fireworkText.style.transform =
            "translate(-50%, calc(-50% + 12px)) scale(0.94)";

        fireworkText.style.filter =
            "blur(8px)";


        await wait(40);


        fireworkText.style.opacity =
            "1";

        fireworkText.style.transform =
            "translate(-50%, -50%) scale(1)";

        fireworkText.style.filter =
            "blur(0px)";

    }


    /* =====================================================
       9-2. 結尾選項

       ★「SANS / 生日快樂 / 祝你有個美好的一天」出現 3 秒後，
         畫面下方出現兩個選項：

         1. 從頭再看一次
         2. 看完整祝福信
    ===================================================== */

    let endingOptionsShown =
        false;


    function buildEndingButton(
        label
    ) {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.textContent =
            label;

        button.style.minHeight =
            "46px";

        button.style.padding =
            "11px 20px";

        button.style.border =
            "1px solid rgba(255,255,255,.42)";

        button.style.borderRadius =
            "999px";

        button.style.background =
            "rgba(8,10,25,.52)";

        button.style.backdropFilter =
            "blur(8px)";

        button.style.webkitBackdropFilter =
            "blur(8px)";

        button.style.color =
            "rgba(255,255,255,.96)";

        button.style.fontFamily =
            '"Microsoft JhengHei", sans-serif';

        button.style.fontSize =
            "clamp(14px, 1.6vw, 17px)";

        button.style.letterSpacing =
            ".06em";

        button.style.cursor =
            "pointer";

        button.style.boxShadow =
            "0 0 20px rgba(210,220,255,.08)";

        button.style.transition =
            "background .25s ease, " +
            "border-color .25s ease, " +
            "transform .25s ease";

        button.addEventListener(
            "mouseenter",
            () => {

                button.style.background =
                    "rgba(255,255,255,.13)";

                button.style.borderColor =
                    "rgba(255,255,255,.68)";

                button.style.transform =
                    "translateY(-2px)";

            }
        );

        button.addEventListener(
            "mouseleave",
            () => {

                button.style.background =
                    "rgba(8,10,25,.52)";

                button.style.borderColor =
                    "rgba(255,255,255,.42)";

                button.style.transform =
                    "translateY(0)";

            }
        );

        return button;

    }


    function getFullBlessingText() {

        const savedWish =
            birthdayWish ||
            localStorage.getItem(
                "sansBirthdayWish"
            ) ||
            "";

        return blessingLines.map(
            (line) => {

                let content =
                    line.text;

                if (
                    line.type === "wish"
                ) {

                    content =
                        savedWish ||
                        "（你寫下的生日願望）";

                }


                /*
                   把動畫用的 <br> 轉成真正換行，
                   讓完整祝福信閱讀起來自然。
                */

                const temp =
                    document.createElement("div");

                temp.innerHTML =
                    content.replace(
                        /<br\s*\/?>/gi,
                        "\n"
                    );

                return (
                    temp.textContent ||
                    ""
                ).trim();

            }
        ).filter(Boolean);

    }


    function showFullBlessingLetter() {

        /*
           避免重複建立。
        */

        const existing =
            document.getElementById(
                "full-blessing-letter-overlay"
            );

        if (existing) {
            return;
        }


        const overlay =
            document.createElement("div");

        overlay.id =
            "full-blessing-letter-overlay";

        overlay.style.position =
            "absolute";

        overlay.style.inset =
            "0";

        overlay.style.zIndex =
            "30";

        overlay.style.display =
            "flex";

        overlay.style.alignItems =
            "center";

        overlay.style.justifyContent =
            "center";

        overlay.style.padding =
            "clamp(18px, 4vw, 42px)";

        overlay.style.background =
            "rgba(4,5,14,.78)";

        overlay.style.backdropFilter =
            "blur(8px)";

        overlay.style.webkitBackdropFilter =
            "blur(8px)";

        overlay.style.opacity =
            "0";

        overlay.style.transition =
            "opacity .45s ease";


        const card =
            document.createElement("div");

        card.style.position =
            "relative";

        card.style.width =
            "min(720px, 100%)";

        card.style.maxHeight =
            "78%";

        card.style.overflowY =
            "auto";

        card.style.boxSizing =
            "border-box";

        card.style.padding =
            "clamp(26px, 5vw, 52px) " +
            "clamp(22px, 5vw, 50px)";

        card.style.border =
            "1px solid rgba(255,255,255,.18)";

        card.style.borderRadius =
            "22px";

        card.style.background =
            "rgba(12,14,31,.88)";

        card.style.boxShadow =
            "0 24px 80px rgba(0,0,0,.34)";


        const title =
            document.createElement("div");

        title.textContent =
            "To Sans";

        title.style.marginBottom =
            "30px";

        title.style.textAlign =
            "center";

        title.style.fontFamily =
            '"Microsoft JhengHei", sans-serif';

        title.style.fontSize =
            "clamp(22px, 3.2vw, 30px)";

        title.style.fontWeight =
            "600";

        title.style.letterSpacing =
            ".08em";

        title.style.color =
            "rgba(255,255,255,.98)";


        const content =
            document.createElement("div");

        content.style.fontFamily =
            '"Microsoft JhengHei", sans-serif';

        content.style.fontSize =
            "clamp(16px, 2vw, 19px)";

        content.style.fontWeight =
            "400";

        content.style.lineHeight =
            "2";

        content.style.letterSpacing =
            ".035em";

        content.style.color =
            "rgba(255,255,255,.88)";

        content.style.whiteSpace =
            "pre-wrap";


        const blessingParts =
            getFullBlessingText();


        /*
           每一段分開放，閱讀比較像完整信件，
           而不是把動畫句子全部黏在一起。
        */

        blessingParts.forEach(
            (part) => {

                const paragraph =
                    document.createElement("p");

                paragraph.textContent =
                    part;

                paragraph.style.margin =
                    "0 0 1.1em";

                content.appendChild(
                    paragraph
                );

            }
        );


        const closeButton =
            document.createElement("button");

        closeButton.type =
            "button";

        closeButton.textContent =
            "關閉";

        closeButton.style.display =
            "block";

        closeButton.style.margin =
            "30px auto 0";

        closeButton.style.minWidth =
            "110px";

        closeButton.style.minHeight =
            "44px";

        closeButton.style.padding =
            "10px 22px";

        closeButton.style.border =
            "1px solid rgba(255,255,255,.34)";

        closeButton.style.borderRadius =
            "999px";

        closeButton.style.background =
            "rgba(255,255,255,.08)";

        closeButton.style.color =
            "#fff";

        closeButton.style.fontFamily =
            '"Microsoft JhengHei", sans-serif';

        closeButton.style.fontSize =
            "15px";

        closeButton.style.cursor =
            "pointer";


        closeButton.addEventListener(
            "click",
            () => {

                overlay.style.opacity =
                    "0";

                setTimeout(
                    () => overlay.remove(),
                    450
                );

            }
        );


        card.appendChild(
            title
        );

        card.appendChild(
            content
        );

        card.appendChild(
            closeButton
        );

        overlay.appendChild(
            card
        );

        blessingScene.appendChild(
            overlay
        );


        requestAnimationFrame(
            () => {

                requestAnimationFrame(
                    () => {

                        overlay.style.opacity =
                            "1";

                    }
                );

            }
        );

    }


    function showEndingOptions() {

        if (
            endingOptionsShown
        ) {
            return;
        }

        endingOptionsShown =
            true;


        const options =
            document.createElement("div");

        options.id =
            "ending-options";

        options.style.position =
            "absolute";

        options.style.left =
            "50%";

        options.style.bottom =
            "clamp(24px, 7%, 64px)";

        options.style.transform =
            "translateX(-50%) translateY(10px)";

        options.style.zIndex =
            "12";

        options.style.width =
            "min(92%, 520px)";

        options.style.display =
            "flex";

        options.style.flexWrap =
            "wrap";

        options.style.alignItems =
            "center";

        options.style.justifyContent =
            "center";

        options.style.gap =
            "12px";

        options.style.opacity =
            "0";

        options.style.transition =
            "opacity .65s ease, " +
            "transform .65s ease";

        options.style.pointerEvents =
            "auto";


        const restartButton =
            buildEndingButton(
                "從頭再看一次"
            );

        const letterButton =
            buildEndingButton(
                "看完整祝福信"
            );


        restartButton.addEventListener(
            "click",
            () => {

                /*
                   不管目前 START_MODE 是什麼，
                   都強制從真正最前面開始。
                */

                const baseUrl =
                    window.location.pathname;

                window.location.href =
                    `${baseUrl}?restart=1`;

            }
        );


        letterButton.addEventListener(
            "click",
            showFullBlessingLetter
        );


        options.appendChild(
            restartButton
        );

        options.appendChild(
            letterButton
        );

        blessingScene.appendChild(
            options
        );


        /*
           ★ 羿潔的落款
           跟結尾選項一起出現，固定在右下角。

           Li 使用接近手寫簽名的系統字型堆疊，
           不使用外部字型，避免中國大陸載入問題。

           日期也改成同一個手寫系統，
           讓整個落款比較像一組完整的簽名設計。
        */

        const signature =
            document.createElement("div");

        signature.id =
            "ending-signature";

        signature.innerHTML = `
            <div style="
                font-family:
                    'Segoe Script',
                    'Bradley Hand ITC',
                    'Lucida Handwriting',
                    cursive;
                font-size: clamp(15px, 1.55vw, 18px);
                font-weight: 400;
                font-style: italic;
                letter-spacing: .03em;
                line-height: 1;
                opacity: .72;
                margin-bottom: 8px;
                transform: rotate(-3deg);
                text-shadow:
                    0 0 8px rgba(255,255,255,.13);
            ">
                2026.09.30
            </div>

            <div style="
                font-family:
                    'Segoe Script',
                    'Bradley Hand ITC',
                    'Lucida Handwriting',
                    cursive;
                font-size: clamp(34px, 4.1vw, 50px);
                font-weight: 500;
                font-style: italic;
                line-height: .95;
                letter-spacing: -.03em;
                transform:
                    rotate(-7deg)
                    skewX(-7deg);
                transform-origin: center;
                text-shadow:
                    0 0 8px rgba(255,255,255,.20),
                    0 0 18px rgba(210,220,255,.08);
            ">
                Li
            </div>

            <div style="
                width: 62%;
                height: 1px;
                margin: 8px auto 0;
                background:
                    linear-gradient(
                        90deg,
                        transparent,
                        rgba(255,255,255,.34),
                        transparent
                    );
                transform: rotate(-4deg);
                opacity: .55;
            "></div>
        `;

        signature.style.position =
            "absolute";

        signature.style.right =
            "clamp(22px, 4vw, 54px)";

        signature.style.bottom =
            "clamp(20px, 4.2%, 42px)";

        signature.style.zIndex =
            "13";

        signature.style.textAlign =
            "center";

        signature.style.color =
            "rgba(255,255,255,.90)";

        signature.style.pointerEvents =
            "none";

        signature.style.opacity =
            "0";

        signature.style.transform =
            "translateY(8px)";

        signature.style.transition =
            "opacity .9s ease .18s, " +
            "transform .9s ease .18s";

        blessingScene.appendChild(
            signature
        );


        requestAnimationFrame(
            () => {

                requestAnimationFrame(
                    () => {

                        options.style.opacity =
                            "1";

                        options.style.transform =
                            "translateX(-50%) translateY(0)";

                        signature.style.opacity =
                            "1";

                        signature.style.transform =
                            "translateY(0)";

                    }
                );

            }
        );

    }


    async function showEndingOptionsAfterDelay() {

        /*
           ★ 使用者指定：
             最後「SANS / 生日快樂 / 祝你有個美好的一天」
             出現 3 秒後才顯示選項。
        */

        await wait(3000);

        showEndingOptions();

    }


    /* =====================================================
       10. 前段煙火 + 文字

       ★ 文字段煙火持續播放，不會因文字出現而停。
       ★ 最後一句改為：
             生日快樂
             祝你有個美好的一天
         這句出現後立刻進入盛大 Finale，
         並貫穿整段 Finale，不消失。
    ===================================================== */

    await wait(
        fireworksTiming.transitionDelay
    );


    /*
       從這裡開始持續放文字段背景煙火。
    */

    startTextBackgroundFireworks();


    await wait(
        fireworksTiming.introFireworksDuration
    );


    await showBirthdayTitle();


    await showFireworkText(
        "JUST DO IT",
        "clamp(38px, 5.5vw, 78px)",
        fireworksTiming.justDoItStay
    );


    await showFireworkText(
        "YOU'RE THE BEST",
        "clamp(32px, 4.8vw, 68px)",
        fireworksTiming.bestStay
    );


    /*
       前面的普通文字段到這裡結束。
       先停止普通背景煙火，
       下一刻直接交給 Finale。
    */

    stopTextBackgroundFireworks();


    /*
       最後訊息浮現。
       注意：這裡沒有 fade out。
    */

    await showPersistentFinalMessage();


    /*
       最後文字出現後：
       - 盛大煙火立即開始
       - 3 秒後顯示兩個選項
       這裡不 await，避免阻塞 Finale。
    */

    showEndingOptionsAfterDelay();


    /*
       文字一出現，就直接開始盛大 Finale。
    */


    /* =====================================================
       11. 最後 30 秒完整煙火秀

       編排：
       0～4 秒     暖場
       4～10 秒    多種類交錯
       10～16 秒   大型金色柳樹
       16～22 秒   密度提高
       22～27 秒   高潮前堆疊
       27～30 秒   Finale
    ===================================================== */

    async function runFinaleShow() {

        const total =
            fireworksTiming.finaleDuration;

        const showStart =
            performance.now();


        /*
           =====================================================
           ★ 30 秒全程盛大版 Finale
           =====================================================

           「生日快樂 / 祝你有個美好的一天」一出現，
           從第一秒開始就直接進入豐盛煙火。

           不再：
           0～10 秒暖場
           10～18 秒才慢慢變大

           改成：
           0～30 秒全程維持大型、多層、左右中齊放。

           為了避免卡頓：
           - 每波控制在 4～5 發
           - 波與波之間保留約 0.85～1.1 秒
           - 用高度與位置製造滿版，不靠瘋狂堆粒子
        */


        async function grandWave(
            power = 1,
            variant = 0
        ) {

            /*
               上層中央主花
            */

            launchRocket({
                x: width() * 0.50,
                y: height() * 0.12,
                type:
                    variant % 3 === 0
                        ? "willow"
                        : "double",
                hue:
                    variant % 4 === 0
                        ? 42
                        : 48,
                strength:
                    1.05 * power
            });


            /*
               左右中高層
            */

            await wait(110);

            launchRocket({
                x: width() * 0.18,
                y:
                    height() *
                    (
                        0.22 +
                        Math.random() * 0.05
                    ),
                type:
                    variant % 2 === 0
                        ? "double"
                        : "chrysanthemum",
                hue: 46,
                strength:
                    1.00 * power
            });

            launchRocket({
                x: width() * 0.82,
                y:
                    height() *
                    (
                        0.21 +
                        Math.random() * 0.05
                    ),
                type:
                    variant % 2 === 0
                        ? "chrysanthemum"
                        : "double",
                hue:
                    Math.random() < 0.82
                        ? 48
                        : 205,
                strength:
                    1.00 * power
            });


            /*
               中下層補花
            */

            await wait(140);

            launchRocket({
                x: width() * 0.33,
                y:
                    height() *
                    (
                        0.34 +
                        Math.random() * 0.05
                    ),
                type:
                    variant % 3 === 1
                        ? "ring"
                        : "peony",
                hue: 42,
                strength:
                    0.88 * power
            });

            launchRocket({
                x: width() * 0.67,
                y:
                    height() *
                    (
                        0.33 +
                        Math.random() * 0.05
                    ),
                type:
                    variant % 3 === 2
                        ? "ring"
                        : "chrysanthemum",
                hue: 50,
                strength:
                    0.88 * power
            });

        }


        /*
           全 30 秒持續盛大。
           前 20 秒每波都已經是滿版，
           20 秒後再稍微加強 power，
           最後 5 秒再做更有收尾感的三波。
        */

        let waveIndex = 0;


        while (
            performance.now() -
            showStart <
            24500
        ) {

            const elapsed =
                performance.now() -
                showStart;

            let power =
                0.98;

            if (
                elapsed >= 12000
            ) {
                power = 1.01;
            }

            if (
                elapsed >= 20000
            ) {
                power = 1.04;
            }


            await grandWave(
                power,
                waveIndex
            );

            waveIndex++;


            await wait(
                820 +
                Math.random() * 250
            );

        }


        /*
           最後約 5.5 秒：
           三波更大型齊放，
           但仍保留間隔避免 Lag。
        */

        const finalWaveTimes = [
            24800,
            26900,
            28900
        ];


        for (
            let i = 0;
            i < finalWaveTimes.length;
            i++
        ) {

            const elapsed =
                performance.now() -
                showStart;

            if (
                elapsed <
                finalWaveTimes[i]
            ) {

                await wait(
                    finalWaveTimes[i] -
                    elapsed
                );

            }


            await grandWave(
                i === 2
                    ? 1.10
                    : 1.06,
                waveIndex + i
            );


            /*
               最後一波再補中央大型主花。
            */

            if (
                i === 2
            ) {

                await wait(160);

                launchRocket({
                    x: width() * 0.50,
                    y: height() * 0.16,
                    type: "willow",
                    hue: 42,
                    strength: 1.14
                });

            }

        }


        const used =
            performance.now() -
            showStart;

        if (
            used < total
        ) {

            await wait(
                total -
                used
            );

        }


        /*
           留下最後餘燼。
        */

        await wait(3400);

    }


    await runFinaleShow();

}


/* =========================================================
   網頁載入

   START_MODE 會決定從哪裡開始。
========================================================= */

window.addEventListener("load", () => {

    /* =====================================================
       測試模式 1：
       直接從 NPC 轉場開始
    ===================================================== */

    if (
        !FORCE_NORMAL_START &&
        START_MODE === "transition"
    ) {

        startTransitionTestMode();

        return;

    }


    /* =====================================================
       測試模式 2：
       直接從星空祝福開始
    ===================================================== */

    if (
        !FORCE_NORMAL_START &&
        START_MODE === "blessing"
    ) {

        startBlessingTestMode();

        return;

    }


    /* =====================================================
       正式完整流程

       ★ 不在這裡自動開始 NPC。
         必須等 Sans 點擊「FOR SANS / 點擊開啟」。

       這樣才能：
       1. 讓 BGM 從 NPC 進場第一刻開始
       2. 避免瀏覽器阻擋有聲自動播放
       3. 避免 NPC 在進入畫面後方偷偷跑完動畫
    ===================================================== */

    entryScreen.hidden = false;

});


/* =========================================================
   ★ 開發測試：
   直接跳到問答完成後 NPC 轉場
========================================================= */

function startTransitionTestMode() {

    /*
       測試模式不顯示 FOR SANS 進入畫面
    */

    entryScreen.hidden = true;

    document.body.classList.remove(
        "site-not-started"
    );


    /*
       隱藏最前面的 NPC 場景
    */

    npcScene.style.display =
        "none";


    /*
       隱藏問卷
    */

    questionScene.classList.remove(
        "show"
    );

    questionScene.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
       隱藏正式祝福
    */

    blessingScene.classList.remove(
        "show"
    );

    blessingScene.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
       讀回之前填過的生日祝福。
       之後做到最後一幕會使用。
    */

    birthdayWish =
        localStorage.getItem(
            "sansBirthdayWish"
        ) || "";


    /*
       直接開始 NPC 轉場
    */

    startTransitionScene();

}


/* =========================================================
   ★ 開發測試：
   直接跳到 NPC 退場後的星空祝福
========================================================= */

function startBlessingTestMode() {

    /*
       測試模式不顯示 FOR SANS 進入畫面
    */

    entryScreen.hidden = true;

    document.body.classList.remove(
        "site-not-started"
    );


    /*
       隱藏最前面的 NPC 場景
    */

    npcScene.style.display =
        "none";


    /*
       隱藏問卷
    */

    questionScene.classList.remove(
        "show"
    );

    questionScene.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
       隱藏 NPC 轉場
    */

    transitionScene.classList.remove(
        "show",
        "leave"
    );

    transitionScene.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
       讀回之前填過的生日祝福
    */

    birthdayWish =
        localStorage.getItem(
            "sansBirthdayWish"
        ) || "";


    /*
       直接開始正式祝福
    */

    startBlessingScene();

}


/* =========================================================
   開場打字效果
========================================================= */

function typeText(text) {

    clearInterval(typingTimer);

    dialogText.textContent = "";

    nextHint.classList.remove("show");

    isTyping = true;

    let index = 0;


    typingTimer = setInterval(() => {

        dialogText.textContent +=
            text.charAt(index);

        index++;


        if (index >= text.length) {

            clearInterval(typingTimer);

            typingTimer = null;

            isTyping = false;

            nextHint.classList.add("show");

        }

    }, 85);

}


/* =========================================================
   顯示開場對話
========================================================= */

function showDialogue() {

    npc.src =
        npcImages[currentDialogue];

    typeText(
        dialogues[currentDialogue]
    );

}


/* =========================================================
   點擊開場對話框
========================================================= */

dialogBox.addEventListener("click", () => {

    if (isTyping) {

        clearInterval(typingTimer);

        typingTimer = null;

        dialogText.textContent =
            dialogues[currentDialogue];

        isTyping = false;

        nextHint.classList.add("show");

        return;

    }


    if (
        currentDialogue >=
        dialogues.length - 1
    ) {

        startQuestionnaire();

        return;

    }


    currentDialogue++;

    showDialogue();

});


/* =========================================================
   啟動問卷
========================================================= */

function startQuestionnaire() {

    /*
       ★ 進入問答後，NPC BGM 繼續播放。
         整個 NPC 主題（開場 + Q1～Q5 + 後段 NPC）
         都使用同一首音樂並循環播放。
    */


    dialogBox.style.pointerEvents =
        "none";

    dialogBox.classList.remove("show");

    dialogBox.classList.add("hide");


    setTimeout(() => {

        questionScene.classList.add("show");

        questionScene.setAttribute(
            "aria-hidden",
            "false"
        );

        questionPaper.classList.add(
            "fly-in"
        );

    }, 350);


    setTimeout(() => {

        npc.style.transition =
            "opacity 0.6s ease";

        npc.style.opacity =
            "0";

    }, 450);


    setTimeout(() => {

        showQuestion(
            0,
            false
        );

    }, 1200);

}


/* =========================================================
   清理上一題
========================================================= */

function clearQuestionUI() {

    questionComment.classList.remove(
        "show"
    );

    questionComment.hidden =
        true;

    commentText.textContent =
        "";

    commentNextAction =
        null;

    commentRetryAction =
        null;


    if (commentRetryButton) {

        commentRetryButton.hidden =
            true;

    }


    answerOptions.hidden =
        true;

    answerOptions.classList.remove(
        "locked"
    );

    answerOptions.innerHTML =
        "";


    yesNoArea.hidden =
        true;

    yesNoArea.classList.remove(
        "teasing"
    );

    yesButton.disabled =
        false;

    noButton.disabled =
        false;

    noButton.classList.remove(
        "caught"
    );


    textAnswerArea.hidden =
        true;

    wishInput.classList.remove(
        "invalid"
    );


    questionTitle.textContent =
        "";

}


/* =========================================================
   顯示題目
========================================================= */

function showQuestion(
    index,
    animateIn = true
) {

    currentQuestion =
        index;

    clearQuestionUI();


    questionNumber.textContent =
        `${String(index + 1).padStart(2, "0")} / 05`;


    if (index <= 2) {

        showMultipleChoiceQuestion(
            index
        );

    } else if (index === 3) {

        showYesNoQuestion();

    } else if (index === 4) {

        showWishQuestion();

    }


    if (animateIn) {

        fadeQuestionContentIn();

    }

}


/* =========================================================
   Q1 ～ Q3
========================================================= */

function showMultipleChoiceQuestion(index) {

    const question =
        questions[index];

    questionTitle.textContent =
        question.title;

    answerOptions.hidden =
        false;


    question.options.forEach(option => {

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.className =
            "answer-button";


        button.innerHTML = `
            <span class="answer-letter">
                ${option.letter}
            </span>

            <span class="answer-text">
                ${option.text}
            </span>
        `;


        button.addEventListener(
            "click",
            () => {

                selectMultipleChoice(
                    button,
                    option,
                    index
                );

            }
        );


        answerOptions.appendChild(
            button
        );

    });

}


/* =========================================================
   Q1 ～ Q3 選擇答案
========================================================= */

function selectMultipleChoice(
    selectedButton,
    option,
    questionIndex
) {

    if (
        answerOptions.classList.contains(
            "locked"
        )
    ) {

        return;

    }


    answerOptions.classList.add(
        "locked"
    );


    questionAnswers[
        `q${questionIndex + 1}`
    ] = option.letter;


    localStorage.setItem(
        "sansQuestionAnswers",
        JSON.stringify(
            questionAnswers
        )
    );


    const buttons =
        answerOptions.querySelectorAll(
            ".answer-button"
        );


    buttons.forEach(button => {

        button.disabled =
            true;


        if (
            button ===
            selectedButton
        ) {

            button.classList.add(
                "selected"
            );

        } else {

            button.classList.add(
                "faded"
            );

        }

    });


    setTimeout(() => {

        showComment(
            option.comment,

            () => {

                goToNextQuestion();

            },

            () => {

                resetMultipleChoice();

            }
        );

    }, 350);

}


/* =========================================================
   Q1 ～ Q3 重新選擇
========================================================= */

function resetMultipleChoice() {

    questionComment.classList.remove(
        "show"
    );


    setTimeout(() => {

        questionComment.hidden =
            true;

        commentText.textContent =
            "";

        commentNextAction =
            null;

        commentRetryAction =
            null;

        answerOptions.classList.remove(
            "locked"
        );


        const buttons =
            answerOptions.querySelectorAll(
                ".answer-button"
            );


        buttons.forEach(button => {

            button.disabled =
                false;

            button.classList.remove(
                "selected"
            );

            button.classList.remove(
                "faded"
            );

        });


        if (commentRetryButton) {

            commentRetryButton.hidden =
                true;

        }

    }, 200);

}


/* =========================================================
   顯示 NPC 評語
========================================================= */

function showComment(
    text,
    nextAction,
    retryAction = null
) {

    commentText.textContent =
        text;

    commentNextAction =
        nextAction;

    commentRetryAction =
        retryAction;


    if (commentRetryButton) {

        commentRetryButton.hidden =
            !retryAction;

    }


    questionComment.hidden =
        false;


    requestAnimationFrame(() => {

        questionComment.classList.add(
            "show"
        );

    });

}


/* =========================================================
   NPC 評語：重新選擇
========================================================= */

if (commentRetryButton) {

    commentRetryButton.addEventListener(
        "click",
        () => {

            if (!commentRetryAction) {

                return;

            }


            const action =
                commentRetryAction;

            commentRetryAction =
                null;

            action();

        }
    );

}


/* =========================================================
   NPC 評語：點擊繼續
========================================================= */

commentNextButton.addEventListener(
    "click",
    () => {

        if (!commentNextAction) {

            return;

        }


        const action =
            commentNextAction;

        commentNextAction =
            null;

        commentRetryAction =
            null;

        action();

    }
);


/* =========================================================
   Q4
========================================================= */

function showYesNoQuestion() {

    questionTitle.innerHTML = `
        <span class="question-main-text">
            以後不管在哪裡，都能一直聽你唱歌嗎？
        </span>

        <span class="question-subtitle">
            你可以點「不能」試試看呀 (¬‿¬)
        </span>
    `;


    yesNoArea.hidden =
        false;

    yesNoArea.classList.remove(
        "teasing"
    );

}


/* =========================================================
   Q4 滑鼠移入「不能」
========================================================= */

noButton.addEventListener(
    "mouseenter",
    () => {

        if (noButton.disabled) {

            return;

        }


        yesNoArea.classList.add(
            "teasing"
        );

    }
);


/* =========================================================
   Q4 滑鼠移出「不能」
========================================================= */

noButton.addEventListener(
    "mouseleave",
    () => {

        if (noButton.disabled) {

            return;

        }


        yesNoArea.classList.remove(
            "teasing"
        );

    }
);


/* =========================================================
   Q4 點「能」
========================================================= */

yesButton.addEventListener(
    "click",
    () => {

        if (
            isQuestionTransitioning
        ) {

            return;

        }


        yesButton.disabled =
            true;

        noButton.disabled =
            true;

        yesNoArea.classList.remove(
            "teasing"
        );


        goToNextQuestion();

    }
);


/* =========================================================
   Q4 點「不能」
========================================================= */

noButton.addEventListener(
    "click",
    () => {

        if (
            isQuestionTransitioning
        ) {

            return;

        }


        yesButton.disabled =
            true;

        noButton.disabled =
            true;

        yesNoArea.classList.remove(
            "teasing"
        );

        noButton.classList.add(
            "caught"
        );


        showComment(
            "……你還真的點得到？哭給你看喔(情勒ing)，再選一次！",

            () => {

                questionComment.classList.remove(
                    "show"
                );


                setTimeout(() => {

                    questionComment.hidden =
                        true;

                    commentText.textContent =
                        "";

                }, 200);


                yesButton.disabled =
                    false;

                noButton.disabled =
                    false;

                noButton.classList.remove(
                    "caught"
                );

            }
        );

    }
);


/* =========================================================
   Q5
========================================================= */

function showWishQuestion() {

    questionTitle.textContent =
        "今年最想實現的生日願望？";

    textAnswerArea.hidden =
        false;

    submitWishButton.textContent =
        "寫好了";

}


/* =========================================================
   Q5 送出
========================================================= */

submitWishButton.addEventListener(
    "click",
    () => {

        const value =
            wishInput.value.trim();


        if (!value) {

            wishInput.classList.remove(
                "invalid"
            );


            void wishInput.offsetWidth;


            wishInput.classList.add(
                "invalid"
            );


            wishInput.focus();


            setTimeout(() => {

                wishInput.classList.remove(
                    "invalid"
                );

            }, 400);


            return;

        }


        birthdayWish =
            value;


        localStorage.setItem(
            "sansBirthdayWish",
            birthdayWish
        );


        submitWishButton.textContent =
            "收到 ✓";

        submitWishButton.disabled =
            true;


        setTimeout(() => {

            closeQuestionnaire();

        }, 600);

    }
);


/* =========================================================
   前往下一題
========================================================= */

function goToNextQuestion() {

    if (
        isQuestionTransitioning
    ) {

        return;

    }


    const nextQuestion =
        currentQuestion + 1;


    if (
        nextQuestion > 4
    ) {

        return;

    }


    isQuestionTransitioning =
        true;


    commentNextButton.disabled =
        true;


    if (commentRetryButton) {

        commentRetryButton.disabled =
            true;

    }


    fadeQuestionContentOut();


    setTimeout(() => {

        clearQuestionUI();

        questionNumber.textContent =
            "";


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                showQuestion(
                    nextQuestion,
                    false
                );


                fadeQuestionContentIn();


                setTimeout(() => {

                    isQuestionTransitioning =
                        false;

                    commentNextButton.disabled =
                        false;


                    if (commentRetryButton) {

                        commentRetryButton.disabled =
                            false;

                    }

                }, 280);

            });

        });

    }, 220);

}


/* =========================================================
   取得題目元素
========================================================= */

function getQuestionContentElements() {

    return [
        questionNumber,
        questionTitle,
        answerOptions,
        yesNoArea,
        textAnswerArea,
        questionComment
    ];

}


/* =========================================================
   題目淡出
========================================================= */

function fadeQuestionContentOut() {

    const elements =
        getQuestionContentElements();


    elements.forEach(element => {

        if (element.hidden) {

            return;

        }


        element.style.animation =
            "none";

        element.style.transition =
            "opacity 0.20s ease";

        element.style.opacity =
            "0";

    });

}


/* =========================================================
   題目淡入
========================================================= */

function fadeQuestionContentIn() {

    const elements =
        getQuestionContentElements();


    elements.forEach(element => {

        if (element.hidden) {

            return;

        }


        element.style.animation =
            "none";

        element.style.transition =
            "none";

        element.style.opacity =
            "0";

    });


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            elements.forEach(element => {

                if (element.hidden) {

                    return;

                }


                element.style.transition =
                    "opacity 0.25s ease";

                element.style.opacity =
                    "1";

            });


            setTimeout(() => {

                elements.forEach(element => {

                    element.style.transition =
                        "";

                    element.style.opacity =
                        "";

                    element.style.animation =
                        "";

                });

            }, 270);

        });

    });

}


/* =========================================================
   問卷完成
========================================================= */

function closeQuestionnaire() {

    questionComment.classList.remove(
        "show"
    );

    questionComment.hidden =
        true;


    questionPaper.classList.add(
        "fold-away"
    );


    setTimeout(() => {

        questionScene.classList.remove(
            "show"
        );


        questionScene.setAttribute(
            "aria-hidden",
            "true"
        );


        startTransitionScene();


        console.log(
            "Q1～Q3 最後選擇：",
            questionAnswers
        );


        console.log(
            "生日祝福：",
            birthdayWish
        );

    }, 950);

}


/* =========================================================
   啟動 NPC 轉場
========================================================= */

function startTransitionScene() {

    currentTransitionDialogue =
        0;

    transitionFinished =
        false;

    isTransitionChangingImage =
        false;


    npcScene.style.pointerEvents =
        "none";


    transitionNpc.src =
        transitionDialogues[0].image;


    transitionScene.setAttribute(
        "aria-hidden",
        "false"
    );


    transitionScene.classList.remove(
        "leave"
    );


    transitionScene.classList.add(
        "show"
    );


    setTimeout(() => {

        transitionDialog.classList.add(
            "show"
        );


        showTransitionDialogue();

    }, 450);

}


/* =========================================================
   NPC 轉場打字
========================================================= */

function typeTransitionText(text) {

    clearInterval(
        transitionTypingTimer
    );


    transitionDialogText.textContent =
        "";


    transitionNextHint.classList.remove(
        "show"
    );


    isTransitionTyping =
        true;


    let index =
        0;


    transitionTypingTimer =
        setInterval(() => {

            transitionDialogText.textContent +=
                text.charAt(index);


            index++;


            if (
                index >=
                text.length
            ) {

                clearInterval(
                    transitionTypingTimer
                );


                transitionTypingTimer =
                    null;


                isTransitionTyping =
                    false;


                transitionNextHint.classList.add(
                    "show"
                );

            }

        }, 85);

}


/* =========================================================
   顯示 NPC 轉場台詞
========================================================= */

function showTransitionDialogue() {

    const dialogue =
        transitionDialogues[
            currentTransitionDialogue
        ];


    typeTransitionText(
        dialogue.text
    );

}


/* =========================================================
   更換 NPC 圖片
========================================================= */

function changeTransitionNpc(
    newImage,
    callback
) {

    if (
        transitionNpc.src.endsWith(
            newImage
        )
    ) {

        callback();

        return;

    }


    isTransitionChangingImage =
        true;


    transitionNpc.classList.add(
        "changing"
    );


    setTimeout(() => {

        transitionNpc.src =
            newImage;


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                transitionNpc.classList.remove(
                    "changing"
                );


                setTimeout(() => {

                    isTransitionChangingImage =
                        false;

                }, 450);


                callback();

            });

        });

    }, 220);

}


/* =========================================================
   點擊 NPC 轉場對話框
========================================================= */

transitionDialog.addEventListener(
    "click",
    () => {

        if (
            isTransitionChangingImage ||
            transitionFinished
        ) {

            return;

        }


        /*
           還在打字時點一下：
           直接顯示完整句子。
        */

        if (
            isTransitionTyping
        ) {

            clearInterval(
                transitionTypingTimer
            );


            transitionTypingTimer =
                null;


            transitionDialogText.textContent =
                transitionDialogues[
                    currentTransitionDialogue
                ].text;


            isTransitionTyping =
                false;


            transitionNextHint.classList.add(
                "show"
            );


            return;

        }


        /*
           最後一句完成：
           NPC 正式退場。
        */

        if (
            currentTransitionDialogue >=
            transitionDialogues.length - 1
        ) {

            finishTransitionScene();

            return;

        }


        currentTransitionDialogue++;


        const nextDialogue =
            transitionDialogues[
                currentTransitionDialogue
            ];


        changeTransitionNpc(
            nextDialogue.image,

            () => {

                showTransitionDialogue();

            }
        );

    }
);


/* =========================================================
   NPC 轉場結束
========================================================= */

function finishTransitionScene() {

    if (
        transitionFinished
    ) {

        return;

    }


    transitionFinished =
        true;


    transitionNextHint.classList.remove(
        "show"
    );


    transitionDialog.style.pointerEvents =
        "none";


    transitionScene.classList.add(
        "leave"
    );


    setTimeout(() => {

        transitionScene.classList.remove(
            "show"
        );


        transitionScene.setAttribute(
            "aria-hidden",
            "true"
        );


        /*
       ★ NPC 主題到這裡才真正結束。
         開場 NPC、Q1～Q5、後段 NPC 都共用同一首 BGM。

         現在要進入第二主題「星空祝福」，
         所以第一首 NPC BGM 在這裡淡出。
    */

    fadeOutNpcBgm(1500);

    startBlessingScene();

    }, 850);

}


/* =========================================================
   小工具：
   等待指定毫秒
========================================================= */

function wait(milliseconds) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            milliseconds
        );

    });

}


/* =========================================================
   正式進入祝福篇
========================================================= */

function startBlessingScene() {

    if (
        blessingSequenceStarted
    ) {

        return;

    }


    blessingSequenceStarted =
        true;


    /*
       先確定文字完全隱藏。
    */

    blessingOpening.classList.remove(
        "show-text"
    );


    blessingOpeningText.classList.remove(
        "show-text",
        "fade-out",
        "is-title",
        "is-story",
        "is-wish"
    );


    blessingOpeningText.innerHTML =
        "";


    /*
       建立隨機星空。
       只會建立一次。
    */

    createStarField();


    /*
       顯示星空。
    */

    blessingScene.setAttribute(
        "aria-hidden",
        "false"
    );


    blessingScene.classList.add(
        "show"
    );


    /*
       ★ 星空出現後等待 1.6 秒，
         開始播放第一句。
    */

    setTimeout(() => {

        playBlessingOpening();

    }, blessingTiming.startDelay);

}


/* =========================================================
   正式祝福：
   依序播放每一段文字
========================================================= */

async function playBlessingOpening() {

    for (
        let index = 0;
        index < blessingLines.length;
        index++
    ) {

        const line =
            blessingLines[index];


        /*
           清除上一段狀態
        */

        blessingOpeningText.classList.remove(
            "show-text",
            "fade-out",
            "is-title",
            "is-story",
            "is-wish"
        );


        /*
           放入文字

           ★ 先清除上一句可能留下的 Q5 換行設定。
        */

        blessingOpeningText.style.whiteSpace =
            "";

        blessingOpeningText.style.overflowWrap =
            "";

        blessingOpeningText.style.wordBreak =
            "";

        blessingOpeningText.style.width =
            "";

        if (
            line.type === "wish"
        ) {

            const savedWish =
                birthdayWish ||
                localStorage.getItem(
                    "sansBirthdayWish"
                ) ||
                "";

            blessingOpeningText.textContent =
                savedWish;


            /*
               ★ Q5 答案不管多長都會自動換行。
               中文、英文、甚至很長且沒有空格的內容，
               都不會跑出畫面。
            */

            blessingOpeningText.style.whiteSpace =
                "normal";

            blessingOpeningText.style.overflowWrap =
                "anywhere";

            blessingOpeningText.style.wordBreak =
                "break-word";

            blessingOpeningText.style.width =
                "min(90%, 900px)";

        } else {

            blessingOpeningText.innerHTML =
                line.text;

        }


        /*
           套用文字類型
        */

        if (
            line.type === "title"
        ) {

            blessingOpeningText.classList.add(
                "is-title"
            );

        } else if (
            line.type === "wish"
        ) {

            blessingOpeningText.classList.add(
                "is-wish"
            );

        } else {

            blessingOpeningText.classList.add(
                "is-story"
            );

        }


        /*
           讓瀏覽器先建立文字
        */

        await wait(60);


        /*
           開始淡入
        */

        blessingOpeningText.classList.add(
            "show-text"
        );


        /*
           等待淡入完成
        */

        await wait(
            blessingTiming.fadeIn
        );


        /*
           完全顯示後停留

           ★ 第一行「嗨Sans」：
             完全顯示後，等待 blessingMusicStartAfter，
             再直接播放「幾分之幾」。

             目前 blessingMusicStartAfter = 800，
             也就是「嗨Sans」完整出現 0.8 秒後開始播。

             之後只要改最上面的 blessingMusicStartAfter，
             不用再算「剩幾秒」。
        */

        if (
            index === 0
        ) {

            const musicStartDelay =
                Math.min(
                    blessingMusicStartAfter,
                    line.stay
                );

            await wait(
                musicStartDelay
            );

            startBlessingBgm();

            await wait(
                Math.max(
                    0,
                    line.stay -
                    musicStartDelay
                )
            );

        } else {

            await wait(
                line.stay
            );

        }


        /*
           開始淡出
        */

        blessingOpeningText.classList.remove(
            "show-text"
        );


        blessingOpeningText.classList.add(
            "fade-out"
        );


        /*
           等待淡出完成
        */

        await wait(
            blessingTiming.fadeOut
        );


        /*
           清除文字
        */

        blessingOpeningText.classList.remove(
            "fade-out",
            "is-title",
            "is-story",
            "is-wish"
        );


        blessingOpeningText.innerHTML =
            "";


        /*
           下一句之前留白
        */

        if (
            index <
            blessingLines.length - 1
        ) {

            await wait(
                blessingTiming.betweenLines
            );

        }

    }


    console.log(
        "祝福第一幕播放完成"
    );


    /*
       「如願」完全淡出後，
       進入最終煙火篇。
    */

    /*
       ★「如願」完全淡出後，
         星空先停留一下，
         再柔和進入煙火篇。
    */

    /*
       「如願」淡出完成後：

       ★ 不立刻轉場。
         先只保留星空，不加任何文字，
         讓「幾分之幾」最後兩句唱完。

       ★ 停留多久請改：
         blessingStarTailDuration

         目前 4200 = 4.2 秒。
    */

    await wait(
        blessingStarTailDuration
    );


    /*
       星空尾聲結束後：
       星空 → 全黑 → 黑屏停留 → 煙火篇
    */

    await playBlackScreenTransition();

}
