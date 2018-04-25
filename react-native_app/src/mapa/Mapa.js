// @flow
import autobind from "autobind-decorator";
import moment from "moment";
import * as React from "react";
import {ScrollView, InteractionManager, StyleSheet, View, Dimensions, Animated} from "react-native";
import {Icon, Picker, H3, Card, CardItem, Text, Body, Container} from "native-base";
import MapView, {Marker} from "react-native-maps";
import {observable, action} from "mobx";
import { observer } from "mobx-react/native";
import openMap from 'react-native-open-maps';

import {BaseContainer, Task, JankWorkaround} from "../components";
import type {ScreenProps} from "../components/Types";

const now = moment();

let markerId = 0;

@observer
export default class Mapa extends React.Component<ScreenProps<>> {

    @observable selectedMonth: number;
    @observable selectedDate: Date;

    state = {
      loading: true,
      fadeAnim: new Animated.Value(1),
      shouldUpdate: false,
      markers: [{key: markerId++, title: "Camión ONEFOOD #23", description: "Presiona para abrir en Mapa.", coordinate: {latitude: 19.4326, longitude: -99.1335}, color: "green"},
                {key: markerId++, title: "Camión ONEFOOD #2", description: "Presiona para abrir en Mapa.", coordinate: {latitude: 19.4452, longitude: -99.1359}, color: "green"}
                ],
    }

    constructor() {
        super();
        const month = now.month();
        const day = now.date();
        this.selectedMonth = month;
        this.selectedDate = { month, day };
    }

    componentWillMount() {
      //this.setState({shouldUpdate: true});
    }

    componentDidMount() {
      //this.setState({ loading: false });
      JankWorkaround.runAfterInteractions(() => {
        this.setState({ loading: false });
      });
    }

    // shouldComponentUpdate() {
    //   return this.state.shouldUpdate
    // }

    @autobind
    openMapMarker(coordinate) {
      openMap({latitude: coordinate.latitude, longitude: coordinate.longitude});

    //  alert("what's up bruvy" + coordinate.latitude + ", " + coordinate.longitude);
    }

    componentWillUnmount() {
      this.setState({shouldUpdate: false});
      // console.log("coming out of map");
      //   Animated.timing(                  // Animate over time
      //   this.state.fadeAnim,            // The animated value to drive
      //   {
      //     toValue: 0,                   // Animate to opacity: 1 (opaque)
      //     duration: 5,              // Make it take a while
      //   }
      // ).start();                        // Starts the animation
    }

    @autobind @action
    onChangeDate (date: Date) {
        this.selectedDate = date;
    }

    render(): React.Node {
        let { fadeAnim } = this.state.fadeAnim;
        const {navigation} = this.props;
        const title = "ONEFOOD";
        const { width, height } = Dimensions.get('window');
        const ratio = width / height;
        const coordinates = {
          latitude: 19.4326,
          longitude: -99.1332,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0922 * ratio,
        };

        return <BaseContainer {...{ navigation, title }}>
                <Card>
                 <CardItem>
                   <Body>
                     <Text style={{color: 'gray'}}>
                       Pasa por tu ONEFOOD a la locación más cercana.
                     </Text>
                   </Body>
                 </CardItem>
               </Card>
                <View style={styles.container}>
                 {this.state.loading ? (
                   <Loading />
                 ) : (
                   <MapView
                     style={styles.map}
                     initialRegion={coordinates}>
                     {this.state.markers.map(marker => (
                        <Marker
                          key={marker.key}
                          title={marker.title}
                          description={marker.description}
                          coordinate={marker.coordinate}
                          pinColor={marker.color}
                          onCalloutPress={() => this.openMapMarker(marker.coordinate)}
                        />
                      ))}
                    </MapView>
                 )}
                </View>
             </BaseContainer>;
    }
}


const Loading = () => (
  <View style={styles.container}>
    <Text>Loading...</Text>
  </View>
);

const {width, height} = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 900,
  },
  map: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: -1,
   }
});
