

#include <MPU6050.h>
#include <Wire.h>


MPU6050 mpu;

int led1 = 10;
int led2 = 9;
int led3 = 6;
int led4 = 5;

// ANALOG pins
int secondfinger = A1;
int thirdfinger = A3;
int fourthfinger = A2;
int firstfinger = A0;
int flex = A4;

// FSR readings 
int secondfingerVal, firstfingerVal, thirdfingerVal, fourthfingerVal = 0;
int flexVal = 0;

// Mapped FSR readings for LEDS
int firstfingerMapped, secondfingerMapped, thirdfingerMapped, fourthfingerMapped = 0;

// used for accelometer 
float xAxisVal, yAxisVal, zAxisVal = 0; 
boolean deviceInMotion;

//flex sensor
const int FLEX_PIN = A4; // Pin connected to voltage divider output
// Measure the voltage at 5V and the actual resistance of your
// 47k resistor, and enter them below:
const float VCC = 4.98; // Measured voltage of Ardunio 5V line
const float R_DIV = 3300.0; // Measured resistance of 3.3k resistor
// Upload the code, then try to adjust these values to more
// accurately calculate bend degree.
const float STRAIGHT_RESISTANCE = 2101.0; // resistance when straight
const float BEND_RESISTANCE = 2075.0; // resistance at 90 deg


// time variables for initial push and realtime reads
unsigned long currentTime, previousTime = 0;

void setup() {
  Serial.begin(115200);

   while(!mpu.begin(MPU6050_SCALE_2000DPS, MPU6050_RANGE_16G))
  {
        // ensure mpu is connected
        delay(500);
  }

  // Dodatkowe opoznienie zasilania akcelerometru 3ms
  mpu.setAccelPowerOnDelay(MPU6050_DELAY_3MS); // short delay of the accelometer start
     
  // Wylaczamy sprzetowe przerwania dla wybranych zdarzen
  // disabling modes not used in this lab 
  mpu.setIntFreeFallEnabled(false);  
  mpu.setIntZeroMotionEnabled(false);
  mpu.setIntMotionEnabled(false);
     
  // Ustawiamy filtr gorno-przepustowy
  mpu.setDHPFMode(MPU6050_DHPF_5HZ); //gyroscope's throughput filter 
     
  // Ustawiamy granice wykrywania ruchu na 4mg (zadana wartosc dzielimy przez 2)
  // oraz minimalny czas trwania na 5ms
  mpu.setMotionDetectionThreshold(2); //activity
  mpu.setMotionDetectionDuration(5);
     
  // Ustawiamy granice wykrywania bezruchu na 8mg (zadana wartosc dzielimy przez 2)
  // oraz minimalny czas trwania na 2ms
  mpu.setZeroMotionDetectionThreshold(8); // inactivity 
  mpu.setZeroMotionDetectionDuration(2);    


  // analog 
  pinMode(firstfinger, INPUT); 
  pinMode(secondfinger, INPUT); 
  pinMode(thirdfinger, INPUT);
  pinMode(fourthfinger, INPUT);
  pinMode(flex,INPUT);

  // leds 
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);
  pinMode(led4, OUTPUT);

  //flex
  pinMode(FLEX_PIN, INPUT);

}

void loop() {

  // update time
  currentTime = millis();
  
  // read from FSR 
  firstfingerVal = analogRead(firstfinger);
  secondfingerVal = analogRead(secondfinger);
  thirdfingerVal = analogRead(thirdfinger);
  fourthfingerVal = analogRead(fourthfinger);  
  flexVal = analogRead(flex);

    // map values from FSR range (0..1023) to LED range (0...255)
  fourthfingerMapped = map(fourthfingerVal, 0, 1023, 0, 255);
  thirdfingerMapped = map(thirdfingerVal, 0, 1023, 0, 255);
  secondfingerMapped = map(secondfingerVal, 0, 1023, 0, 255);
  firstfingerMapped = map(firstfingerVal, 0, 1023, 0, 255);

  // set LED brightness to mapped values
  analogWrite(led1, fourthfingerMapped);
  analogWrite(led2, thirdfingerMapped);
  analogWrite(led3, secondfingerMapped);
  analogWrite(led4, firstfingerMapped);

  // acceleration vectors
  Vector rawAccel = mpu.readRawAccel();
  Vector normAccel = mpu.readNormalizeAccel();

   // board activity state (in motion y/n)
  Activites act = mpu.readActivites();
  
  if (act.isActivity) {
    deviceInMotion = true;
  }

  if (act.isInactivity) {
    deviceInMotion = false;
  }

//  xAxisVal = rawAccel.XAxis; //normAccel.XAxis
//  yAxisVal = rawAccel.YAxis; //normAccel.YAxis
//  zAxisVal = rawAccel.ZAxis; //normAccel.ZAxis


//flex sensor
  // Read the ADC, and calculate voltage and resistance from it
  int flexADC = analogRead(FLEX_PIN);
  float flexV = flexADC * VCC / 1023.0;
  float flexR = R_DIV * (VCC / flexV - 1.0);
  //Serial.println("Resistance: " + String(flexR) + " ohms");

  // Use the calculated resistance to estimate the sensor's
  // bend angle:
  float angle = map(flexR, STRAIGHT_RESISTANCE, BEND_RESISTANCE,
                   0, 90.0);
                   
   
 // print out data after short delay to ensure valid data is being sent
  if ((currentTime - previousTime) >= 100) {
    previousTime = currentTime;

 
    
    String toPrint = String(firstfingerVal) + "$" 
    + String(secondfingerVal) + "$" + String(thirdfingerVal) + "$" + String(fourthfingerVal) + "$" 
   + String(deviceInMotion) + "$" + String(flexR) + "$" + String(angle);


    Serial.print(toPrint);
    Serial.println();
  }

  delay(10); // short delay between reads
}
