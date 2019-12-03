   // "react-native-audio-recorder-player": "^2.1.4",
    "react-native-audio-transcoder": "^0.3.0",


The mobile project contains two files i used for abstraction
=================================================================

1) firebaseRefs.js  // which you can find at "./app/utils/refs.js" for changing firestoreRefs and realTime database refs
2) strings.js // which you can find at "./app/utils/strings.js" for changing ui values;


---------------------------------------------------------------------------------------------------------------
To change references to database collections to look like model equal to the model of the DB now and to change project this procedures will help
-----------------------------------------------------------------------------------------------------------------

1) (a) Download the googleservice.json file from the newly created project and replace the existing one on the "android/app/" folder on the project directory => for mobile. NOTE do this before build ;

   (1b) Go to directory of Admin project and at root directory is the firebase.js file were configuration for firebase for web project resides. copy the new project configuration looking like the present one and replace;

2) Make sure you set firestore and Real time database of firebase security rules to allow read and write without auth;

3) To change values of the structure of database collections, subcollection or path in real time database pleas look at each structure in database and change value as you find in refs files. after editing a ref file in either mobile or web copy and paste in the other counterpart since they are all the same.