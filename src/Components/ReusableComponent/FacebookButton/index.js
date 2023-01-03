import React from 'react';
import {Pressable, ToastAndroid, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import {styles} from './style';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';
import {postRequest, postRequestWithToken} from '../../../App/fetch';
import {
  getDataFromAsyncStorage,
  setDataToAsyncStorage,
} from '../../../utils/getAndSetDataToAsync';
import {userDataFromAsyncStorage} from '../../../Store/slices/user';
import {showMessage} from 'react-native-flash-message';
import {BASE_URL} from '../../../App/api';
import {useEffect} from 'react';
import {PermissionsAndroid} from 'react-native';
import {useState} from 'react';
import { isMatch } from '../../../Store/slices';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {UserData} from '../../../Store/slices';
// import SocialLoginAndSignup from '../../../utils/SocialLoginAndSignup';
// import {userDataFromAsyncStorage} from '../../../Store/slices/user';
// import UserData from '../../../Store/slices';

function FacebookButton({navigation, loading, setLoading}) {
  const dispatch = useDispatch();

  const fbLogin = resCallBack => {
    LoginManager.logOut();
    LoginManager.logInWithPermissions(['email', 'public_profile']).then(
      function (result) {
        if (
          result.declinedPermissions &&
          result.declinedPermissions.includes('email')
        ) {
          resCallBack({message: 'Email is required'});
        }
        if (result.isCancelled) {
          console.log('error');
          setLoading(false);
        } else {
          // console.log(
          // "Login success with permissions: " +
          //   result.grantedPermissions.toString()
          const infoRequest = new GraphRequest(
            '/me?fields=email,name,picture,birthday',
            null,
            resCallBack,
          );
          new GraphRequestManager().addRequest(infoRequest).start();
          // );
        }
      },
      function (error) {
        console.log('Login fail with error: ' + error);
        setLoading(false);
        ToastAndroid.show(error.toString(), ToastAndroid.SHORT);
      },
    );
  };

  const onFbLogin = async () => {
    console.log('fb function');
    setLoading(true);
    try {
      await fbLogin(_responseInfoCallBack);
    } catch (e) {
      console.log('error raised', e);
      setLoading(false);
    }
  };

  const [location, setLocation] = useState(false);
  // const [region, setRegion] = useState();

  // function to check permissions and get Location

  const _responseInfoCallBack = async (error, result) => {
    if (error) {
      console.log('error top', error);
      setLoading(false);

      return;
    } else {
      const userData = result;
      // console.log('fb data **********', userData);
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        setLoading(false);
        throw 'Something went wrong obtaining access token';
      }

      // Create a Firebase credential with the AccessToken
      const facebookCredential = auth.FacebookAuthProvider.credential(
        data.accessToken,
      );

      // Sign-in the user with the credential
      const res = await auth().signInWithCredential(facebookCredential);
      // console.log('Facebook User Details', res.user);

      // dispatch(UserData(res));
      console.log('Facebook userData:', res.user._user);

      // ========================================
      postRequest(`${BASE_URL}/socialLogin`, {
        userName: res.user?._user.displayName,
        userEmail: res.user?._user.email.toLowerCase(),
        userLoginType: 1,
        userSocialToken: data.accessToken,
      })
        .then(async res => {
          setLoading(false);
          console.log('Login Response From Backend:', res);
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
      // let userType = 'fb';
      // SocialLoginAndSignup(res, userType, setLoading)
      //   .then(res => {
      //     console.log('last then:', res);
      //     dispatch(userDataFromAsyncStorage(JSON.parse(res)));
      //     setLoading(false);
      //   })
      //   .catch(err => console.log('last catch:', err));
      // setLoading(false);

      // navigation.navigate('profile');
    }
  };

  return (
    <View>
      <Pressable onPress={onFbLogin}>
        <Icon
          style={styles.icons}
          name="facebook-square"
          size={35}
          color="#4285F4"
        />
      </Pressable>
    </View>
  );
}

export default FacebookButton;
