// @flow
import autobind from "autobind-decorator";
import * as React from "react";
import {
    StyleSheet, Image, View, ScrollView, KeyboardAvoidingView, TextInput, SafeAreaView
} from "react-native";
import {H1, Button, Text} from "native-base";
import {Constants} from "expo";

import Mark from "./Mark";

import {Images, WindowDimensions, Field, NavigationHelpers, Small} from "../components";
import {AnimatedView} from "../components/Animations";
import type {ScreenProps} from "../components/Types";

import variables from "../../native-base-theme/variables/commonColor";

export default class Login extends React.Component<ScreenProps<>> {

    password: TextInput;

    @autobind
    setPasswordRef(input: TextInput) {
        this.password = input;
    }

    @autobind
    goToPassword() {
        this.password.focus();
    }

    @autobind
    signIn() {
        NavigationHelpers.reset(this.props.navigation, "Walkthrough");
    }

    @autobind
    signUp() {
        this.props.navigation.navigate("SignUp");
    }

    render(): React.Node {
        return (
            <View style={styles.container}>
                <Image source={Images.login} style={styles.image} />
                <SafeAreaView style={StyleSheet.absoluteFill}>
                    <ScrollView contentContainerStyle={[StyleSheet.absoluteFill, styles.content]}>
                        <KeyboardAvoidingView behavior="position">
                            <AnimatedView
                                style={{ height: height - Constants.statusBarHeight, justifyContent: "flex-end" }}
                            >
                            <View style={styles.logo}>
                                <View>
                                    <Mark />
                                    <H1 style={styles.title}>ONEFOOD</H1>
                                </View>
                            </View>
                            <View>
                                <Field
                                    label="Email"
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                    onSubmitEditing={this.goToPassword}
                                    inverse
                                />
                                <Field
                                    label="Contraseña"
                                    secureTextEntry
                                    autoCapitalize="none"
                                    returnKeyType="go"
                                    textInputRef={this.setPasswordRef}
                                    onSubmitEditing={this.signIn}
                                    last
                                    inverse
                                />
                                <View>
                                    <View>
                                        <Button primary full onPress={this.signIn}>
                                            <Text>Sign In</Text>
                                        </Button>
                                    </View>
                                    <View>
                                        <Button transparent full onPress={this.signUp}>
                                            <Small style={{color: "white"}}>{"Don't have an account? Sign Up"}</Small>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                            </AnimatedView>
                        </KeyboardAvoidingView>
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }
}

const {height, width} = WindowDimensions;

//TODO: aqui cambiar para que salga el Sign Up.
const styles = StyleSheet.create({
    container: {
        flexGrow: 1
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        height,
        width
    },
    content: {
        flexGrow: 1
    },
    logo: {
        marginVertical: variables.contentPadding * 2,
        alignItems: "center"
    },
    title: {
        marginVertical: variables.contentPadding * 2,
        color: "white",
        textAlign: "center"
    },
    small: {
        color: "white"
    }
});
