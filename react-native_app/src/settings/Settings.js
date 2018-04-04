// @flow
import * as React from "react";
import {View, Dimensions, Image, StyleSheet} from "react-native";
import {Text, Icon} from "native-base";

import {BaseContainer, Images, Field, SingleChoice, Firebase} from "../components";
import type {ScreenProps} from "../components/Types";

import variables from "../../native-base-theme/variables/commonColor";

export default class Settings extends React.Component<ScreenProps<>> {

    render(): React.Node {
        var user = Firebase.auth.currentUser;

        return <BaseContainer title="Settings" navigation={this.props.navigation} scrollable>
            <View style={style.section}>
                <Text>GENERAL</Text>
            </View>
            <View>
                <Field label="Name" defaultValue={user.displayName}/>
                <Field label="Email" defaultValue={user.email} />
            </View>

            <View style={style.section}>
                <Text>MÉTODO DE PAGO</Text>
            </View>
            <View>

            </View>
        </BaseContainer>;
    }
}

const {width} = Dimensions.get("window");
const style = StyleSheet.create({
    img: {
        width,
        height: width * 500 / 750
    },
    add: {
        backgroundColor: "white",
        height: 50,
        width: 50,
        borderRadius: 25,
        position: "absolute",
        bottom: variables.contentPadding,
        left: variables.contentPadding,
        alignItems: "center",
        justifyContent: "center"
    },
    section: {
        padding: variables.contentPadding * 2,
        borderBottomWidth: variables.borderWidth,
        borderColor: variables.listBorderColor
    }
});
