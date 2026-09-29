
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
