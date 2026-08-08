  #include <Servo.h>

  Servo thumb;
  Servo indexF;
  Servo middle;
  Servo ring;
  Servo pinky;

  // 👉 每个手指自己的三个挡位（你可以随便改）
  int thumbPos[3]  = {120, 80, 10};
  int indexPos[3]  = {130, 90, 0};
  int middlePos[3] = {30, 85, 180};
  int ringPos[3]   = {130, 100, 20};
  int pinkyPos[3]  = {46, 80, 180};
  
  bool unknownMode = false;
  unsigned long lastUnknownUpdate = 0;
  int thumbCur, indexCur, middleCur, ringCur, pinkyCur;
  int thumbDir = 1, indexDir = -1, middleDir = 1, ringDir = -1, pinkyDir = 1;

void startUnknownMode() {
  unknownMode = true;

  thumbCur  = thumbPos[1];
  indexCur  = indexPos[1];
  middleCur = middlePos[1];
  ringCur   = ringPos[1];
  pinkyCur  = pinkyPos[1];

  thumbDir  = 1;
  indexDir  = 1;
  middleDir = 1;
  ringDir   = 1;
  pinkyDir  = 1;

  thumb.write(thumbCur);
  indexF.write(indexCur);
  middle.write(middleCur);
  ring.write(ringCur);
  pinky.write(pinkyCur);

  delay(133);
  lastUnknownUpdate = millis();
}
void animateUnknownHand() { 
  if (!unknownMode) return;

  unsigned long now = millis();
  if (now - lastUnknownUpdate < 20) return;
  lastUnknownUpdate = now;

  thumbCur  += thumbDir * 4;
  indexCur  += indexDir * 5;
  middleCur += middleDir * 4;
  ringCur   += ringDir * 4;
  pinkyCur  += pinkyDir * 5;

  int thumbMin  = min(thumbPos[1], thumbPos[2]);
  int thumbMax  = max(thumbPos[1], thumbPos[2]);

  int indexMin  = min(indexPos[1], indexPos[2]);
  int indexMax  = max(indexPos[1], indexPos[2]);

  int middleMin = min(middlePos[1], middlePos[2]);
  int middleMax = max(middlePos[1], middlePos[2]);

  int ringMin   = min(ringPos[1], ringPos[2]);
  int ringMax   = max(ringPos[1], ringPos[2]);

  int pinkyMin  = min(pinkyPos[1], pinkyPos[2]);
  int pinkyMax  = max(pinkyPos[1], pinkyPos[2]);

  if (thumbCur <= thumbMin || thumbCur >= thumbMax) thumbDir *= -1;
  if (indexCur <= indexMin || indexCur >= indexMax) indexDir *= -1;
  if (middleCur <= middleMin || middleCur >= middleMax) middleDir *= -1;
  if (ringCur <= ringMin || ringCur >= ringMax) ringDir *= -1;
  if (pinkyCur <= pinkyMin || pinkyCur >= pinkyMax) pinkyDir *= -1;

  thumbCur  = constrain(thumbCur,  thumbMin,  thumbMax);
  indexCur  = constrain(indexCur,  indexMin,  indexMax);
  middleCur = constrain(middleCur, middleMin, middleMax);
  ringCur   = constrain(ringCur,   ringMin,   ringMax);
  pinkyCur  = constrain(pinkyCur,  pinkyMin,  pinkyMax); 

  thumb.write(thumbCur);
  indexF.write(indexCur);
  middle.write(middleCur);
  ring.write(ringCur);
  pinky.write(pinkyCur);
}

  // 👉 控制整只手
  void setHand(int step) {
    thumb.write(thumbPos[step]);
    indexF.write(indexPos[step]);
    middle.write(middlePos[step]);
    ring.write(ringPos[step]);
    pinky.write(pinkyPos[step]);
  }
  void gestureV() {
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[2]);  // 食指伸
    middle.write(middlePos[2]); // 中指伸
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[0]);   // 小指收
  }
  void gesturethumbup(){
    thumb.write(thumbPos[2]);   // 拇指伸
    indexF.write(indexPos[0]);  // 食指收
    middle.write(middlePos[0]); // 中指收
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[0]);   // 小指收
  }
  void gesture3fingerssalute(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[2]);  // 食指伸
    middle.write(middlePos[2]); // 中指伸
    ring.write(ringPos[2]);     // 无名指伸
    pinky.write(pinkyPos[0]);   // 小指收
  }
  void gesture_shocker(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[2]);  // 食指伸
    middle.write(middlePos[2]); // 中指伸
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[2]);   // 小指伸
  }
  void gesture_serbianthree(){
    thumb.write(thumbPos[2]);   // 拇指伸
    indexF.write(indexPos[2]);  // 食指伸
    middle.write(middlePos[2]); // 中指伸
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[0]);   // 小指收
  }
  void gesture_openpalm(){
    thumb.write(thumbPos[2]);   // 拇指伸
    indexF.write(indexPos[2]);  // 食指伸
    middle.write(middlePos[2]); // 中指伸
    ring.write(ringPos[2]);     // 无名指伸
    pinky.write(pinkyPos[2]);   // 小指伸
  }
  void gesture_ok(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[0]);  // 食指收
    middle.write(middlePos[2]); // 中指伸
    ring.write(ringPos[2]);     // 无名指伸
    pinky.write(pinkyPos[2]);   // 小指伸
  }
  void gesture_middlefinger(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[0]);  // 食指收
    middle.write(middlePos[2]); // 中指伸
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[0]);   // 小指收
  }
  void gesture_littlefinger(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[0]);  // 食指收
    middle.write(middlePos[0]); // 中指收
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[2]);   // 小指伸
  }
  void gesture_indexfinger(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[2]);  // 食指伸
    middle.write(middlePos[0]); // 中指收
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[0]);   // 小指收
  }
  void gesture_horns(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[2]);  // 食指伸
    middle.write(middlePos[0]); // 中指收
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[2]);   // 小指伸
  }
  void gesture_hand6(){
    thumb.write(thumbPos[2]);   // 拇指伸
    indexF.write(indexPos[0]);  // 食指收
    middle.write(middlePos[0]); // 中指收
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[2]);   // 小指伸
  }
  void gesture_curl(){
    thumb.write(thumbPos[0]);   // 拇指收
    indexF.write(indexPos[1]);  // 食指弯
    middle.write(middlePos[0]); // 中指收
    ring.write(ringPos[0]);     // 无名指收
    pinky.write(pinkyPos[0]);   // 小指收
  }
  void setup() {
    Serial.begin(9600);

    thumb.attach(3);
    indexF.attach(5);
    middle.attach(6);
    ring.attach(9);
    pinky.attach(10);

    setHand(0);   // 上电直接张开
    
  }

  void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();

    switch (cmd) {
      case 'V': unknownMode = false; gestureV(); break;
      case '1': unknownMode = false; gesturethumbup(); break;
      case '2': unknownMode = false; gesture3fingerssalute(); break;
      case '3': unknownMode = false; gesture_shocker(); break;
      case '4': unknownMode = false; gesture_serbianthree(); break;
      case '5': unknownMode = false; gesture_openpalm(); break;
      case '6': unknownMode = false; gesture_ok(); break;
      case '7': unknownMode = false; gesture_middlefinger(); break;
      case '8': unknownMode = false; gesture_littlefinger(); break;
      case '9': unknownMode = false; gesture_indexfinger(); break;
      case 'a': unknownMode = false; gesture_horns(); break;
      case 'b': unknownMode = false; gesture_hand6(); break;
      case 'c': unknownMode = false; gesture_curl(); break;
      case 'h': unknownMode = false; setHand(0); break;// Reset(closed fist)
      case 'u': startUnknownMode(); break; 

      default:
        Serial.println("Unknown command");
        Serial.println(cmd);
        break;
      }
   
    }
    animateUnknownHand();

}

