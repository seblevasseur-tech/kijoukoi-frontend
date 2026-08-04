import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginData = { login: '', password: '' };
  errorMessage = '';
  
  isPasswordFocused = false;
  isPasswordVisible = false;
  
  private authService = inject(AuthService);
  private router = inject(Router);

  // --- SVG Element References ---
  @ViewChild('mySVG') mySVG!: ElementRef<SVGElement>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  
  @ViewChild('twoFingers') twoFingers!: ElementRef<SVGGElement>;
  @ViewChild('armL') armL!: ElementRef<SVGGElement>;
  @ViewChild('armR') armR!: ElementRef<SVGGElement>;
  @ViewChild('eyeL') eyeL!: ElementRef<SVGGElement>;
  @ViewChild('eyeR') eyeR!: ElementRef<SVGGElement>;
  @ViewChild('nose') nose!: ElementRef<SVGPathElement>;
  @ViewChild('mouth') mouth!: ElementRef<SVGGElement>;
  @ViewChild('mouthBG') mouthBG!: ElementRef<SVGPathElement>;
  @ViewChild('mouthOutline') mouthOutline!: ElementRef<SVGPathElement>;
  @ViewChild('tooth') tooth!: ElementRef<SVGPathElement>;
  @ViewChild('tongue') tongue!: ElementRef<SVGGElement>;
  @ViewChild('chin') chin!: ElementRef<SVGPathElement>;
  @ViewChild('face') face!: ElementRef<SVGPathElement>;
  @ViewChild('eyebrow') eyebrow!: ElementRef<SVGGElement>;
  @ViewChild('outerEarL') outerEarL!: ElementRef<SVGGElement>;
  @ViewChild('outerEarR') outerEarR!: ElementRef<SVGGElement>;
  @ViewChild('earHairL') earHairL!: ElementRef<SVGGElement>;
  @ViewChild('earHairR') earHairR!: ElementRef<SVGGElement>;
  @ViewChild('hair') hair!: ElementRef<SVGPathElement>;
  @ViewChild('bodyBG') bodyBG!: ElementRef<SVGPathElement>;
  @ViewChild('bodyBGchanged') bodyBGchanged!: ElementRef<SVGPathElement>;

  private activeElement: string | null = null;
  private blinkingTween: gsap.core.Tween | null = null;
  private eyeScale = 1;
  private eyesCovered = false;
  private showPasswordClicked = false;
  isLoginMode = true;
  
  private screenCenter = 0;
  private svgCoords = { x: 0, y: 0 };
  private emailCoords = { x: 0, y: 0 };
  private emailScrollMax = 0;
  private chinMin = 0.5;

  private eyeLCoords = {x: 0, y: 0};
  private eyeRCoords = {x: 0, y: 0};
  private noseCoords = {x: 0, y: 0};
  private mouthCoords = {x: 0, y: 0};

  ngOnInit() {
    // Basic setup if needed
  }

  setMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
    this.errorMessage = '';
  }

  ngAfterViewInit() {
    // Initial SVG measurements
    setTimeout(() => {
      this.initMeasurements();
      
      // Move arms to initial positions
      gsap.set(this.armL.nativeElement, {x: -93, y: 220, rotation: 105, transformOrigin: "top left"});
      gsap.set(this.armR.nativeElement, {x: -93, y: 220, rotation: -105, transformOrigin: "top right"});
      
      // Initial mouth positioning
      gsap.set(this.mouth.nativeElement, {transformOrigin: "center center"});
      
      this.startBlinking(5);
    }, 100);
  }

  ngOnDestroy() {
    this.stopBlinking();
    gsap.killTweensOf('*');
  }

  // --- Helpers for Coordinates ---

  private getPosition(el: HTMLElement | SVGElement) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    };
  }

  private initMeasurements() {
    const svgEl = this.mySVG.nativeElement;
    const emailEl = this.emailInput.nativeElement;

    this.svgCoords = this.getPosition(svgEl);
    this.emailCoords = this.getPosition(emailEl);
    this.screenCenter = this.svgCoords.x + (svgEl.getBoundingClientRect().width / 2);
    
    // Relative coordinates based on viewBox 200x200 vs actual size...
    // In original, it used fixed offsets. We use similar logic.
    this.eyeLCoords = {x: this.svgCoords.x + 84, y: this.svgCoords.y + 76};
    this.eyeRCoords = {x: this.svgCoords.x + 113, y: this.svgCoords.y + 76};
    this.noseCoords = {x: this.svgCoords.x + 97, y: this.svgCoords.y + 81};
    this.mouthCoords = {x: this.svgCoords.x + 100, y: this.svgCoords.y + 100};
    
    this.emailScrollMax = emailEl.scrollWidth;
  }

  private getAngle(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y1 - y2, x1 - x2);
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  private startBlinking(delayParam?: number) {
    let delay = delayParam ? this.getRandomInt(delayParam) : 1;
    this.blinkingTween = gsap.to([this.eyeL.nativeElement, this.eyeR.nativeElement], {
      duration: 0.1,
      delay: delay,
      scaleY: 0,
      yoyo: true,
      repeat: 1,
      transformOrigin: "center center",
      onComplete: () => {
        this.startBlinking(12);
      }
    });
  }

  private stopBlinking() {
    if (this.blinkingTween) {
      this.blinkingTween.kill();
      this.blinkingTween = null;
    }
    gsap.set([this.eyeL.nativeElement, this.eyeR.nativeElement], {scaleY: this.eyeScale});
  }

  // --- Animations ---

  private calculateFaceMove() {
    const emailEl = this.emailInput.nativeElement;
    let carPos = emailEl.selectionEnd || emailEl.value.length;
    
    // Approximate caret position to avoid buggy DOM injection
    const charWidth = 9; // average pixels per char
    let textWidth = carPos * charWidth;
    if (textWidth > emailEl.clientWidth - 20) {
      textWidth = emailEl.clientWidth - 20;
    }
    
    // Absolute caret coordinates on screen
    const caretAbsoluteX = this.emailCoords.x + textWidth;
    const caretAbsoluteY = this.emailCoords.y + (emailEl.clientHeight / 2);

    const dFromC = this.screenCenter - caretAbsoluteX;

    const eyeLAngle = this.getAngle(this.eyeLCoords.x, this.eyeLCoords.y, caretAbsoluteX, caretAbsoluteY);
    const eyeRAngle = this.getAngle(this.eyeRCoords.x, this.eyeRCoords.y, caretAbsoluteX, caretAbsoluteY);
    const noseAngle = this.getAngle(this.noseCoords.x, this.noseCoords.y, caretAbsoluteX, caretAbsoluteY);
    const mouthAngle = this.getAngle(this.mouthCoords.x, this.mouthCoords.y, caretAbsoluteX, caretAbsoluteY);

    const eyeLX = Math.cos(eyeLAngle) * 20;
    const eyeLY = Math.sin(eyeLAngle) * 10;
    const eyeRX = Math.cos(eyeRAngle) * 20;
    const eyeRY = Math.sin(eyeRAngle) * 10;
    const noseX = Math.cos(noseAngle) * 23;
    const noseY = Math.sin(noseAngle) * 10;
    const mouthX = Math.cos(mouthAngle) * 23;
    const mouthY = Math.sin(mouthAngle) * 10;
    const mouthR = Math.cos(mouthAngle) * 6;
    const chinX = mouthX * 0.8;
    const chinY = mouthY * 0.5;
    
    let chinS = 1 - ((dFromC * 0.15) / 100);
    if (chinS > 1) {
      chinS = 1 - (chinS - 1);
      if (chinS < this.chinMin) chinS = this.chinMin;
    }
    
    const faceX = mouthX * 0.3;
    const faceY = mouthY * 0.4;
    const faceSkew = Math.cos(mouthAngle) * 5;
    const eyebrowSkew = Math.cos(mouthAngle) * 25;
    const outerEarX = Math.cos(mouthAngle) * 4;
    const outerEarY = Math.cos(mouthAngle) * 5;
    const hairX = Math.cos(mouthAngle) * 6;
    const hairS = 1.2;

    const easeStr = "power4.out";
    
    gsap.to(this.eyeL.nativeElement, {duration: 1, x: -eyeLX , y: -eyeLY, ease: easeStr});
    gsap.to(this.eyeR.nativeElement, {duration: 1, x: -eyeRX , y: -eyeRY, ease: easeStr});
    gsap.to(this.nose.nativeElement, {duration: 1, x: -noseX, y: -noseY, rotation: mouthR, transformOrigin: "center center", ease: easeStr});
    gsap.to(this.mouth.nativeElement, {duration: 1, x: -mouthX , y: -mouthY, rotation: mouthR, transformOrigin: "center center", ease: easeStr});
    gsap.to(this.chin.nativeElement, {duration: 1, x: -chinX, y: -chinY, scaleY: chinS, ease: easeStr});
    gsap.to(this.face.nativeElement, {duration: 1, x: -faceX, y: -faceY, skewX: -faceSkew, transformOrigin: "center top", ease: easeStr});
    gsap.to(this.eyebrow.nativeElement, {duration: 1, x: -faceX, y: -faceY, skewX: -eyebrowSkew, transformOrigin: "center top", ease: easeStr});
    gsap.to(this.outerEarL.nativeElement, {duration: 1, x: outerEarX, y: -outerEarY, ease: easeStr});
    gsap.to(this.outerEarR.nativeElement, {duration: 1, x: outerEarX, y: outerEarY, ease: easeStr});
    gsap.to(this.earHairL.nativeElement, {duration: 1, x: -outerEarX, y: -outerEarY, ease: easeStr});
    gsap.to(this.earHairR.nativeElement, {duration: 1, x: -outerEarX, y: outerEarY, ease: easeStr});
    gsap.to(this.hair.nativeElement, {duration: 1, x: hairX, scaleY: hairS, transformOrigin: "center bottom", ease: easeStr});
  }

  private resetFace() {
    const easeStr = "power4.out";
    gsap.to([this.eyeL.nativeElement, this.eyeR.nativeElement], {duration: 1, x: 0, y: 0, ease: easeStr});
    gsap.to(this.nose.nativeElement, {duration: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, ease: easeStr});
    gsap.to(this.mouth.nativeElement, {duration: 1, x: 0, y: 0, rotation: 0, ease: easeStr});
    gsap.to(this.chin.nativeElement, {duration: 1, x: 0, y: 0, scaleY: 1, ease: easeStr});
    gsap.to([this.face.nativeElement, this.eyebrow.nativeElement], {duration: 1, x: 0, y: 0, skewX: 0, ease: easeStr});
    gsap.to([this.outerEarL.nativeElement, this.outerEarR.nativeElement, this.earHairL.nativeElement, this.earHairR.nativeElement, this.hair.nativeElement], {duration: 1, x: 0, y: 0, scaleY: 1, ease: easeStr});
  }

  private coverEyes() {
    gsap.killTweensOf([this.armL.nativeElement, this.armR.nativeElement]);
    gsap.set([this.armL.nativeElement, this.armR.nativeElement], {visibility: "visible"});
    gsap.to(this.armL.nativeElement, {duration: 0.45, x: -93, y: 10, rotation: 0, ease: "power1.out"});
    gsap.to(this.armR.nativeElement, {duration: 0.45, x: -93, y: 10, rotation: 0, ease: "power1.out", delay: 0.1});
    
    // Instead of MorphSVG for the body background, we can just toggle visibility
    gsap.set(this.bodyBG.nativeElement, {display: 'none'});
    gsap.set(this.bodyBGchanged.nativeElement, {display: 'block'});
    this.eyesCovered = true;
  }

  private uncoverEyes() {
    gsap.killTweensOf([this.armL.nativeElement, this.armR.nativeElement]);
    gsap.to(this.armL.nativeElement, {duration: 1.35, y: 220, ease: "power1.out"});
    gsap.to(this.armL.nativeElement, {duration: 1.35, rotation: 105, ease: "power1.out", delay: 0.1});
    gsap.to(this.armR.nativeElement, {duration: 1.35, y: 220, ease: "power1.out"});
    gsap.to(this.armR.nativeElement, {duration: 1.35, rotation: -105, ease: "power1.out", delay: 0.1, onComplete: () => {
      gsap.set([this.armL.nativeElement, this.armR.nativeElement], {visibility: "hidden"});
    }});
    
    gsap.set(this.bodyBGchanged.nativeElement, {display: 'none'});
    gsap.set(this.bodyBG.nativeElement, {display: 'block'});
    this.eyesCovered = false;
  }

  private spreadFingers() {
    gsap.to(this.twoFingers.nativeElement, {duration: 0.35, transformOrigin: "bottom left", rotation: 30, x: -9, y: -2, ease: "power2.inOut"});
  }

  private closeFingers() {
    gsap.to(this.twoFingers.nativeElement, {duration: 0.35, transformOrigin: "bottom left", rotation: 0, x: 0, y: 0, ease: "power2.inOut"});
  }

  // --- Handlers ---

  onEmailFocus() {
    this.activeElement = "email";
    this.onEmailInput();
  }

  onEmailInput() {
    if (this.activeElement === 'email') {
      this.calculateFaceMove();
    }
    
    const val = this.loginData.login;
    const easeStr = "power4.out";
    
    if (val.length > 0) {
      if (val.includes('@')) {
        // "large" mouth
        gsap.to(this.tooth.nativeElement, {duration: 1, x: 3, y: -2, ease: easeStr});
        gsap.to(this.tongue.nativeElement, {duration: 1, y: 2, ease: easeStr});
        gsap.to([this.eyeL.nativeElement, this.eyeR.nativeElement], {duration: 1, scaleX: 0.65, scaleY: 0.65, ease: easeStr, transformOrigin: "center center"});
        this.eyeScale = 0.65;
        // Without MorphSVG, let's scale the mouth a bit to simulate opening
        gsap.to([this.mouthBG.nativeElement, this.mouthOutline.nativeElement], {duration: 1, scaleY: 1.5, scaleX: 1.2, transformOrigin: "center center", ease: easeStr});
      } else {
        // "medium" mouth
        gsap.to(this.tooth.nativeElement, {duration: 1, x: 0, y: 0, ease: easeStr});
        gsap.to(this.tongue.nativeElement, {duration: 1, x: 0, y: 1, ease: easeStr});
        gsap.to([this.eyeL.nativeElement, this.eyeR.nativeElement], {duration: 1, scaleX: 0.85, scaleY: 0.85, ease: easeStr});
        this.eyeScale = 0.85;
        gsap.to([this.mouthBG.nativeElement, this.mouthOutline.nativeElement], {duration: 1, scaleY: 1.1, scaleX: 1.05, transformOrigin: "center center", ease: easeStr});
      }
    } else {
      // "small" mouth
      gsap.to(this.tooth.nativeElement, {duration: 1, x: 0, y: 0, ease: easeStr});
      gsap.to(this.tongue.nativeElement, {duration: 1, y: 0, ease: easeStr});
      gsap.to([this.eyeL.nativeElement, this.eyeR.nativeElement], {duration: 1, scaleX: 1, scaleY: 1, ease: easeStr});
      this.eyeScale = 1;
      gsap.to([this.mouthBG.nativeElement, this.mouthOutline.nativeElement], {duration: 1, scaleY: 1, scaleX: 1, transformOrigin: "center center", ease: easeStr});
    }
  }

  onEmailBlur() {
    this.activeElement = null;
    setTimeout(() => {
      if (this.activeElement !== 'email') {
        this.resetFace();
      }
    }, 100);
  }

  onPasswordFocus() {
    this.activeElement = "password";
    if (!this.eyesCovered) {
      this.coverEyes();
    }
    if (this.isPasswordVisible) {
      this.spreadFingers();
    }
  }

  onPasswordBlur() {
    this.activeElement = null;
    setTimeout(() => {
      if (this.activeElement !== "password") {
        this.uncoverEyes();
      }
    }, 100);
  }

  togglePasswordVisibility(event: Event) {
    event.preventDefault(); // Prevent input blur
    this.isPasswordVisible = !this.isPasswordVisible;
    if (this.isPasswordVisible) {
      this.spreadFingers();
    } else {
      this.closeFingers();
    }
    
    // Ensure eyes stay covered and password remains focused
    this.activeElement = 'password';
    setTimeout(() => this.passwordInput.nativeElement.focus(), 10);
  }

  onSubmit() {
    if (!this.loginData.login || !this.loginData.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    
    if (this.isLoginMode) {
      this.authService.login(this.loginData.login, this.loginData.password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = 'Mot de passe et/ou login invalide';
        }
      });
    } else {
      this.authService.register(this.loginData.login, this.loginData.password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la création du compte';
        }
      });
    }
  }
}
