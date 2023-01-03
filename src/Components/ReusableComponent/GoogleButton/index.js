import React, {useState} from 'react';
import {Image, Pressable, ToastAndroid, View} from 'react-native';
import googleIcon from 'src/Assets/Images/icons/icons.png';
import {styles} from './style';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';
import {isMatch, UserData} from '../../../Store/slices';
import SignUp from '../../../Screens/SignUp';
import SocialLoginAndSignup from '../../../utils/SocialLoginAndSignup';
import {
  getUserDataFromAsyncStorage,
  removeUserDataFromAsyncStorage,
} from '../../../Store/reducers/AuthReducer';
import {userDataFromAsyncStorage} from '../../../Store/slices/user';
// import {
//   getDataFromAsyncStorage,
//   setDataToAsyncStorage,
// } from '../../utils/getAndSetDataToAsync';
import {postRequest, postRequestWithToken} from '../../../App/fetch';
import {BASE_URL} from '../../../App/api';
import {showMessage} from 'react-native-flash-message';
import {showError} from '../../../utils/PopupFunctions';
import {
  getDataFromAsyncStorage,
  setDataToAsyncStorage,
} from '../../../utils/getAndSetDataToAsync';
import AsyncStorage from '@react-native-async-storage/async-storage';

GoogleSignin.configure({
  webClientId:
    '239188409090-aodjm55hnt4mlrqg3tjs9qr3a07pnnsr.apps.googleusercontent.com',
});
function GoogleButton({navigation, loading, setLoading}) {
  const [user, setUser] = useState({});
  const dispatch = useDispatch();

  // const [loading, setLoading] = useState(false);

  // console.log('login',user);

  const googleSignIn = async () => {
    console.log('google');
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();
      // setUser({userInfo});
      const {idToken} = await GoogleSignin.signIn();
      console.log('idToken: ', idToken);

      // Create a Google credential with the token
      const googleCredential = await auth.GoogleAuthProvider.credential(
        idToken,
      );

      // Sign-in the user with the credential
      const res = await auth().signInWithCredential(googleCredential);
      console.log('response in google login', res);
      console.log('idToken', idToken);

      // ========================================
      postRequest(`${BASE_URL}/socialLogin`, {
        userName: res.user?._user.displayName,
        userEmail: res.user?._user.email.toLowerCase(),
        userLoginType: 1,
        userSocialToken: idToken,
      })
        .then(async res => {
          setLoading(false);
          console.log('Login Response From Backend:', res.data.userToken);
          if (res.success === true) {
            try {
              // const v = {
              //   userId: res.data._id,
              //   name: res.data.userName ? res.data.userName : 'user',
              //   email: res.data.userEmail,
              //   userPassword: res.data.userPassword,
              //   userGenderShow: res.data.userGenderShow,
              //   isNewUser: res.data.isNewUser,
              //   profile_pic: res.data.userImage ? res.data.userImage : '',
              //   userAboutMe: res.data.userAboutme ? res.data.userAboutme : '',
              //   userCountry: res.data.userCountry ? res.data.userCountry : '',
              //   userCity: res.data.userCity ? res.data.userCity : '',
              //   userLifeStyleItems: res.data.userLifeStyleItems
              //     ? res.data.userLifeStyleItems
              //     : [],
              //   userInterest: res.data.userInterest
              //     ? res.data.userInterest
              //     : [],
              //   userAlbums: res.data.userAlbums ? res.data.userAlbums : [],
              //   userLon: res.data.userLon ? res.data.userLon : '',
              //   userLat: res.data.userLat ? res.data.userLat : '',
              //   userLocationPrivacy: res.data.userLocationPrivacy
              //     ? res.data.userLocationPrivacy
              //     : '',
              //   userNotificationToken: res.data.userNotificationToken
              //     ? res.data.userNotificationToken
              //     : '',
              //   userLastOnline: res.data.userLastOnline
              //     ? res.data.userLastOnline
              //     : '',
              //   userLastOnline: res.data.userLastOnline
              //     ? res.data.userLastOnline
              //     : '',
              //   userDOB: res.data.userDOB ? res.data.userDOB : '',
              //   userCreatedOn: res.data.userCreatedOn
              //     ? res.data.userCreatedOn
              //     : '',
              //   userToken: res.data.userToken,
              //   userDeviceType: res.data.userDeviceType,
              //   userGender: res.data.userGender,
              //   __v: res.data.__v,
              //   type: 'email',
              //   phoneNumber: res.data.userNumber ? res.data.userNumber : '',
              //   partnerProfile: res.data.partnerProfile
              //     ? res.data.partnerProfile
              //     : '',
              // };
              // =====

              // =====
              console.log('res.data.userChatRooms:', res.data.userChatRooms);
              // ==============
              let fcmToken = await AsyncStorage.getItem('fcmToken');
              let chatRoom = res.data.userChatRooms;
              let data = {
                userName: res.data.userName ? res.data.userName : 'user',
                userGender: res.data.userGender,
                userGenderShow: false,
                userLoginType: 0,
                userAboutme: res.data.userAboutme,
                userInterest: res.data.userInterest,
                userLifeStyleItems: res.data.userLifeStyleItems,
                userLon: '0.213213',
                userLat: '0.323213',
                userLocationPrivacy: false,
                userCountry: 'USA',
                userCity: 'New York',
                userNotificationToken: fcmToken,
                userLastOnline: '',
                userDeviceType: Platform.OS === 'android' ? 0 : 1,
                userDOB: res.data.userDOB,
                userNumber: res.data.userNumber,
              };
              let reducerToken = res.data.userToken;
              await postRequestWithToken(
                `${BASE_URL}/updateuser`,
                data,
                res.data.userToken,
              )
                .then(async res => {
                  if (res.success === true) {
                    const v = {
                      userId: res.data._id,
                      name: res.data.userName ? res.data.userName : 'user',
                      email: res.data.userEmail,
                      userPassword: res.data.userPassword,
                      userGenderShow: res.data.userGenderShow,
                      isNewUser: res.data.isNewUser,
                      profile_pic: res.data.userImage ? res.data.userImage : '',
                      userAboutMe: res.data.userAboutme
                        ? res.data.userAboutme
                        : '',
                      userCountry: res.data.userCountry
                        ? res.data.userCountry
                        : '',
                      userCity: res.data.userCity ? res.data.userCity : '',
                      userLifeStyleItems: res.data.userLifeStyleItems
                        ? res.data.userLifeStyleItems
                        : [],
                      userInterest: res.data.userInterest
                        ? res.data.userInterest
                        : [],
                      userAlbums: res.data.userAlbums
                        ? res.data.userAlbums
                        : [],
                      userLon: res.data.userLon ? res.data.userLon : '',
                      userLat: res.data.userLat ? res.data.userLat : '',
                      userLocationPrivacy: res.data.userLocationPrivacy
                        ? res.data.userLocationPrivacy
                        : '',
                      userNotificationToken: res.data.userNotificationToken
                        ? res.data.userNotificationToken
                        : '',
                      userLastOnline: res.data.userLastOnline
                        ? res.data.userLastOnline
                        : '',
                      userLastOnline: res.data.userLastOnline
                        ? res.data.userLastOnline
                        : '',
                      userDOB: res.data.userDOB ? res.data.userDOB : '',
                      userCreatedOn: res.data.userCreatedOn
                        ? res.data.userCreatedOn
                        : '',
                      userToken: reducerToken,
                      userDeviceType: res.data.userDeviceType,
                      userGender: res.data.userGender,
                      __v: res.data.__v,
                      type: 'email',
                      phoneNumber: res.data.userNumber
                        ? res.data.userNumber
                        : '',
                      partnerProfile: res.data.partnerProfile
                        ? res.data.partnerProfile
                        : '',
                      userChatRooms: chatRoom ? chatRoom : '',
                    };
                    console.log('v: ', v);
                    setDataToAsyncStorage('token', JSON.stringify(v.userToken));
                    setDataToAsyncStorage('user', JSON.stringify(v));
                    getDataFromAsyncStorage('user')
                      .then(res => {
                        if (v?.partnerProfile != '') {
                          dispatch(isMatch(true));
                          dispatch(userDataFromAsyncStorage(JSON.parse(res)));
                          console.log(
                            'Login withPartner profile: isMatch & userDataFromAsyncStorage both dispatch',
                          );
                          setLoading(false);
                        } else {
                          dispatch(userDataFromAsyncStorage(JSON.parse(res)));
                          console.log('Login without Partner profile');
                          setLoading(false);
                        }
                      })
                      .catch(error => console.log('error:', error));
                  } else {
                    setLoading(false);
                    console.log('Something went wrong else');
                  }
                })
                .catch(error => {
                  console.log('updateProfile Catch Error:', error);
                  setLoading(false);
                });
              console.log(v);
            } catch (e) {
              console.log(e);
            }
          } else if (res.success === false) {
            setLoading(false);
            showError(`Error:${res.message}`);
            // alert('Please Enter Correct Email & Password')
          } else {
            setLoading(false);
            showMessage('Something went wrong please try again');
          }
        })
        .catch(error => {
          setLoading(false);
          console.log('GoogleloginError:', error);
        });
      // ========================================

      // let userType = 'gmail'
      // SocialLoginAndSignup(res,userType,setLoading,dispatch).then(res =>{
      //   console.log('last then:', res)
      //   dispatch(userDataFromAsyncStorage(JSON.parse(res)));
      //   setLoading(false)
      // }).catch(err => console.log('last catch:',err))
      // let data= res.user?._user
      // dispatch(UserData(res));
      // setLoading(false);

      // navigation.navigate('profile');
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // ToastAndroid.show(error.toString(), ToastAndroid.SHORT);
        setLoading(false);
        console.log('statusCodes.SIGN_IN_CANCELLED', error);
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // ToastAndroid.show(error.toString(), ToastAndroid.SHORT);
        setLoading(false);
        console.log('statusCodes.IN_PROGRESS', error);
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('statusCodes.PLAY_SERVICES_NOT_AVAILABLE', error);
        // ToastAndroid.show(error.toString(), ToastAndroid.SHORT);
        setLoading(false);
        // play services not available or outdated
      } else {
        console.log('GoogleLoginError:', error);
        // ToastAndroid.show(error.toString(), ToastAndroid.SHORT);
        setLoading(false);
        // some other error happened
      }
    }
  };

  return (
    <View style={styles.containerTinyLogo}>
      <Pressable onPress={googleSignIn}>
        <Image style={styles.tinyLogo} source={googleIcon} />
      </Pressable>
    </View>
  );
}

export default GoogleButton;
