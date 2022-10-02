import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  pitch = 0.4;
  rate = 1;

  textObj = {
    text: `One day, Molly the milkmaid had filled her pails with milk. Her job was to milk the cows, and then bring the milk to the market to sell. Molly loved to think about what to spend her money on.
    As she filled the pails with milk and went to market, she again thought of all the things she wanted to buy. As she walked along the road, she thought of buying a cake and a basket full of fresh strawberries.
    A little further down the road, she spotted a chicken. She thought, “With the money I get from today, I’m going to buy a chicken of my own. That chicken will lay eggs, then I will be able to sell milk and eggs and get more money!”
    She continued, “With more money, I will be able to buy a fancy dress and make all the other milkmaids jealous.” Out of excitement, Molly started skipping, forgetting about the milk in her pails. Soon, the milk started spilling over the edges, covering Molly.
    Drenched, Molly said to herself, “Oh no! I will never have enough money to buy a chicken now.” She went home with her empty pails.
    “Oh, my goodness! What happened to you?” Molly’s mother asked.
    “I was too busy dreaming about all the things I wanted to buy that I forgot about the pails,” she answered.
    “Oh, Molly, my dear. How many times do I need to say, ‘Don’t count your chickens until they hatch?`,
    htmlText: '',
  };
  ngOnInit() {
    window.speechSynthesis.onvoiceschanged = () => {
      this.voices = speechSynthesis.getVoices();
    };
  }
  voice;
  voices = [];
  voiceChange(v) {
    this.voice = v.value;
  }
  sentences = [];
  speakingIndex = -1;
  speak() {
    if (window.speechSynthesis.speaking || this.paused === true) {
      return;
    }
    this.sentences = this.textObj.text.match(/[^\.!\?]+[\.!\?]+["']?|\s*$/g);
    this.cdr.detectChanges();
    this.handleText();
  }
  handleText() {
    if (this.sentences.length - 1 > this.speakingIndex) {
      this.speakSentence(() => {
        this.handleText();
      });
    } else {
      this.speakingIndex = -1;
      this.textObj.htmlText = '';
      this.cdr.detectChanges();
      console.log('finished all text');
    }
  }
  speakSentence(cb) {
    let that = this;
    this.speakingIndex++;
    this.cdr.detectChanges();
    let utter = new SpeechSynthesisUtterance(
      this.sentences[this.speakingIndex]
    );
    utter.onend = function () {
      if (that.paused === false) {
        cb();
      }
    };
    utter.onboundary = function (event: any) {
      if (event.name === 'word') {
        let currentSentence = that.sentences[that.speakingIndex];
        that.textObj.htmlText =
          currentSentence.slice(0, event.charIndex) +
          '<span style="color: red;">' +
          currentSentence.slice(
            event.charIndex,
            event.charIndex + event.charLength
          ) +
          '</span>' +
          currentSentence.slice(
            event.charIndex + event.charLength,
            currentSentence.length
          );
        that.cdr.detectChanges();
      }
    };
    utter.rate = this.rate;
    utter.pitch = this.pitch;
    if (this.voice) {
      utter.voice = this.voice;
    }
    window.speechSynthesis.speak(utter);
  }
  stopSpeak() {
    this.sentences = [];
    this.speakingIndex = -1;
    window.speechSynthesis.cancel();
  }
  paused = false;
  pauseUnpause() {
    if (this.paused === true) {
      this.paused = false;
      this.handleText();
    } else {
      this.paused = true;
      this.speakingIndex--;
      window.speechSynthesis.cancel();
    }
  }
  @ViewChild('textInput') inputText: ElementRef;
  selectAllInput() {
    <HTMLInputElement>this.inputText.nativeElement.select();
  }
}
