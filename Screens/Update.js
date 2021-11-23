import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, Modal, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import constant from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storageRef, fb } from '../data/firebase'

const UpdatePage = ({navigation}) => {

const [image, setImage] = useState('');

const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };
  const [uploding, setUploading] = useState(false)

    const uploadImage = async () => {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(xhr.response);
            };
            xhr.onerror = function() {
                reject(new TypeError('Network request failed!'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', image, true);
            xhr.send(null);
        });

        const ref = storageRef.child(new Date().toISOString());
        const snapshot = ref.put(blob);

        snapshot.on(fb, () => {
            setUploading(true);
        },
        (error) => {
            setUploading(false);
            console.log(error);
            blob.close();
            return
        },
        () => {
            snapshot.snapshot.ref.getDownloadURL().then((url) => {
                setUploading(false)
                console.log('Download url : ', url)
                setImage(url)
                blob.close();
                return url
            })
        }
        );
    }

  const update = () => {
    try {
        const uid = auth?.currentUser?.uid;
        return db
          .collection("users")
          .doc(uid)
          .update({
            uid: uid,
            image: image,
          })
          .then((snapShot) => navigation.navigate("Profile"))
          .catch((error) => {
            const errorMessage = error.message;
            alert("Couldn't update resturant Details");
          });
        // ...
      } catch (error) {
        const errorMessage = error.message;
        alert("Failed to update restaurant");
      }
  }


return (
    <View  style={styles.container}>
      <View style={{marginLeft: 30, marginTop: 40}}>
        <FontAwesome name="window-close" size={24} color="#5f9ea0" onPress={() => navigation.navigate("Profile")}/>
      </View>

    <View style={{justifyContent: "center", alignItems: "center"}}>
        <TouchableOpacity  onPress={pickImage}>
        <Image style={styles.image} source={{uri: image}} value={image}/>
              
        <FontAwesome name="camera" size={24} color="black" style={{marginLeft: 80, marginTop: -25}}/>
        </TouchableOpacity> 
    </View>

          <View style={{paddingTop: 55}}>
            <TouchableOpacity style={styles.touch1} onPress={update}>
                <Text style={styles.text2}>Update Details</Text>
            </TouchableOpacity>  
            </View>
            <View style={{paddingTop: 55}}>
            {!uploding ? <TouchableOpacity style={styles.touch1} onPress={uploadImage}>
                <Text style={styles.text2}>Upload image</Text>
            </TouchableOpacity> : <ActivityIndicator size='large' color='red' /> } 
            </View>
    </View>
    )
}
export default UpdatePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: "100%",
        width: "100%"
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 200,
        borderWidth: 2,
        backgroundColor: "gray"
      },
    TextField: {
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: 20,
        height: 95,
        width: 250,
        backgroundColor: "#ffffff",
        padding: 10,
        paddingTop: 3,
        marginTop: 25
      },
    input: {
        height: 40,
        margin: 12,
        padding: 10,
      },
    touch1: {
        backgroundColor: '#5f9ea0',
        width: 220,
        borderRadius: 20,
        padding: 15,
        marginLeft: 70,
      },
    text2: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
      },
})