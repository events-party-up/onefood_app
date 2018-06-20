import React from 'react';
import {View, TouchableOpacity, Dimensions, StyleSheet, Alert} from 'react-native';
import { BarCodeScanner, Permissions } from 'expo';
import {Container, Text, Header, Right, Left, Icon, Content, Button, Body, Title, H3} from 'native-base';
import autobind from "autobind-decorator";
import Modal from 'react-native-modalbox';
import variables from "../../native-base-theme/variables/commonColor";
import * as Constants from '../Constants';
import {BaseContainer, PedidoItem, Firebase} from "../components";

export default class ScanPedido extends React.Component {
  state = {
    hasCameraPermission: null,
    pedidoInfo: {},
    pedidoValido: false,
    justScanned: false,
    isOpen: false,
  };

  open() {
    this.setState({isOpen: true});
  }

  componentDidMount () {
    this.setState({justScanned: false});
  }
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  @autobind
  async handleScan({type, data}): Promise<void> {

    if (this.state.justScanned) {
      return;
    }

    this.setState({justScanned: true});
    //Firebase.firestore.collection("pedidos").doc("")
    console.log("data and type ", data, type);

    const docRef = await Firebase.firestore.collection("pedidos").doc(data);
    var docExists = false;
    var pedidoValido = true;
    var pedidoInfo = {};

    await docRef.get().then(function(doc) {
        if (doc.exists) {
            docExists = true;
            console.log("Pedido exists!!  data:", doc.data());

            if (doc.data().reclamado) {
              pedidoValido = false;
            }

            var prevData = doc.data();
            prevData["reclamado"] = true;
            docRef.set(prevData)
            .then(function() {
              console.log("successfully claimed pedido");
            });
            pedidoInfo = prevData;
            // .catch(function(error) {
            //   console.error("error writing doc: ", error);
            // });
        } else {
            pedidoValido = false;
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });


    if (docExists && pedidoValido) {
      this.setState({pedidoInfo: pedidoInfo, pedidoValido: true});
    } else {
      this.setState({pedidoValido: false});
    }

    this.refs.pedidoModal.open();
  }

  @autobind
  onModalClose() {
    console.log("yeah nigg");
    this.setState({justScanned: false});
  }

  @autobind
  dismissModal() {
    this.setState({isOpen: false});
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <Text></Text>;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <Modal style={[style.modal]} isOpen={this.state.isOpen} animationDuration={400} swipeToClose={false} coverScreen={true} position={"center"}>
          <Container safe={true} >
          <Header style={{borderBottomWidth: 1, borderColor: variables.lightGray, height: 70, width: width}}>
              <Left>
                  <Button transparent onPress={this.dismissModal}>
                      <Icon name="ios-close-outline" style={style.closeIcon} />
                  </Button>
              </Left>
              <Body style={{width: 60}}>
                  <Title>ESCANEAR</Title>
              </Body>
              <Right/>
          </Header>
          <BarCodeScanner onBarCodeRead={this.handleScan} style={{height: width, width: width}}>
        </BarCodeScanner>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: variables.lightGray, marginTop: 15, fontSize: 16}}>Escanea Pedidos ONEFOOD</Text>
          </View>
        </Container>
        <PedidoInfo ref={"pedidoModal"} onModalClose={this.onModalClose} pedidoInfo={this.state.pedidoInfo} pedidoValido={this.state.pedidoValido}/>
        </Modal>
      );
    }
  }
}


class PedidoInfo extends React.Component<PedidoProps> {
    state = {
      detailModalIsOpen: false,
    }

    open() {
      ///this.setState({detailModalIsOpen: true});
      this.refs.modal.open();
      //this.refs.modal.open();
    }

    @autobind
    setModalStateClosed() {
      this.props.onModalClose();
    }

    @autobind
    dismissModal() {
      this.refs.modal.close();
      //this.setState({detailModalIsOpen: false});
      //this.props.onModalClose();
    }

    render(): React.Node {
      const {pedidoInfo, pedidoValido} = this.props;
      var fecha = Constants.convertirFecha(pedidoInfo.fecha);

      return <Modal style={pedidoValido ? style.modalValido : style.modalChico} swipeToClose={true} position={"center"} onClosed={this.setModalStateClosed} backdrop={true} coverScreen={false} ref={"modal"}>
          {
            pedidoValido ?
            (<Container style={ style.containerChico}>
              <Text style={{fontSize: 22, fontWeight: "bold"}}>Pedido Válido</Text>
                <PedidoItem
                  numero={pedidoInfo.cantidades[0]}
                  title="COCOA"
              />
              <View style={{marginTop: 20}}>
                <H3>{fecha}</H3>
              </View>
            </Container>) :
            (<Container style={style.containerChico}>
              <Text style={{fontSize: 22, fontWeight: "bold"}}>Pedido Inválido</Text>
              <Text style={{color: variables.lightGray}}>Este pedido ya fue reclamado.</Text>
              </Container>
            )
          }
        </Modal>;
    }
}

const {width, height} = Dimensions.get("window");

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: height,
  },
  containerChico: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  closeIcon: {
      fontSize: 50,
      marginLeft: 20,
      color: variables.brandPrimary
  },
  closeButton: {
    marginTop: 60,
  },
    modal: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: variables.brandInfo,
  },
  modalValido: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: variables.brandInfo,
    height: 350,
    width: 350,
  },
  modalChico: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: variables.brandInfo,
    height: 300,
    width: 300,
  },
});
