// ==UserScript==
// @name         Timeline Player on mstdn-picker
// @namespace    https://github.com/asymme/
// @version      0.1
// @description  It can play the same timeline as when live
// @author       Asymme
// @match        https://rbtnn.github.io/mstdn-picker/index.html*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    class Player {
        constructor() {
            this.MAIN_TIMER = null;
            this.RIGHT_HEADER = document.querySelector('.right_header');
            this.HIDDEN_LENGTH = 0;
            this.DIFF_TIME = 0;
            this.TOOTS = null;
            this.createPlayButton();
        }

        createPlayButton() {
            const button = document.createElement('div');
            button.innerHTML = 'PLAY';
            button.setAttribute('class', 'button');
            button.setAttribute('id', 'play_button');
            button.style.cursor = 'pointer';
            button.addEventListener('click', (function(self) {
                return function(e) {
                    self.pushButton(e.target);
                };
            })(this), false);

            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.setAttribute('colspan', '2');
            td.appendChild(button);
            tr.appendChild(td);
            document.querySelector('.left__input tbody').appendChild(tr);
        }

        pushButton(elem) {
            if(this.MAIN_TIMER) {
                this.stop(elem);
                return;
            }

            this.TOOTS = document.querySelectorAll('.status-content');
            const len = this.TOOTS.length;
            if(len === 0) {
                alert('There are no toots.');
                return;
            }

            let startIndex = 0;
            for(let i = 0; i < len; i++) {
                if(this.TOOTS[i].getBoundingClientRect().top >= this.RIGHT_HEADER.clientHeight) {
                    startIndex = i;
                    break;
                }
            }

            elem.innerHTML = 'STOP';
            const content = this.TOOTS[startIndex];
            this.DIFF_TIME = new Date().getTime() - Number(content.getAttribute('data-created_at'));
            this.HIDDEN_LENGTH = document.querySelectorAll('.status-hidden').length;
            this.MAIN_TIMER = this.loop(startIndex);
            this.flash(null, content);
        }

        loop(index) {
            const self = this;
            return setTimeout(function() {
                if(index === self.TOOTS.length - 1 || self.MAIN_TIMER === null || document.querySelectorAll('.status-hidden').length !== self.HIDDEN_LENGTH) {
                    self.stop(document.querySelector('#play_button'));
                    return;
                }

                clearTimeout(self.MAIN_TIMER);
                const nextIndex = index + 1;
                if(new Date().getTime() < Number(self.TOOTS[nextIndex].getAttribute('data-created_at')) + self.DIFF_TIME) {
                    self.MAIN_TIMER = self.loop(index);
                    return;
                }

                const content = self.TOOTS[nextIndex];
                const targetY = content.getBoundingClientRect().top + content.clientHeight;
                const halfWindowHeight = window.innerHeight / 2;
                if(targetY > halfWindowHeight) {
                    self.scrollToNext(null, targetY + window.pageYOffset - halfWindowHeight, 1);
                }
                self.MAIN_TIMER = self.loop(nextIndex);
                self.flash(null, content);
            }, 1000);
        }

        flash(timer, content) {
            content.style.opacity = (timer) ? parseFloat(content.style.opacity) + 0.05 : 0.0;
            clearTimeout(timer);
            if(content.style.opacity >= 1.0) { return; }

            const self = this;
            timer = setTimeout(function() {
                self.flash(timer, content);
            }, 33);
        }

        scrollToNext(timer, targetY, add) {
            clearTimeout(timer);
            const scrollLimit = window.pageYOffset + window.innerHeight;
            const pageHeight = this.RIGHT_HEADER.clientHeight + document.querySelector('#status_list').clientHeight;
            if(scrollLimit >= pageHeight || window.pageYOffset > targetY) { return; }

            window.scrollTo(0, window.pageYOffset + add);
            const self = this;
            timer = setTimeout(function() {
                self.scrollToNext(timer, targetY, add + 1);
            }, 33);
        }

        stop(elem) {
            clearTimeout(this.MAIN_TIMER);
            this.MAIN_TIMER = null;
            elem.innerHTML = 'PLAY';
        }
    }
    new Player();
})();