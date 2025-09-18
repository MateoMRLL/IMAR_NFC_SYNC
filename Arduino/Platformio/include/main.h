#ifndef MAIN_H
#define MAIN_H

#include <Arduino.h>

String getCardUID();
String scanCardWithServer(String uid);
void loginToServer(String username);

#endif // MAIN_H
