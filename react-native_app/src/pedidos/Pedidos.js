// @flow
import autobind from "autobind-decorator";
import * as React from "react";
import {StyleSheet, View, Text, TouchableOpacity, Dimensions, RefreshControl, ScrollView} from "react-native";
import {Button, Icon, Left, Right, H3, Separator, ListItem, List} from "native-base";
import {observable, action} from "mobx";
import { observer, inject } from "mobx-react/native";
import Modal from 'react-native-modalbox';
import QRCode from 'react-native-qrcode';
import store from "../store";
import PTRView from 'react-native-pull-to-refresh';


import {BaseContainer, Styles, JankWorkaround, Task, PedidoItem, Firebase, Controller} from "../components";
import type {ScreenProps} from "../components/Types";
import PedidoModel from "../components/APIStore";

import variables from "../../native-base-theme/variables/commonColor";

@inject('store') @observer
export default class Pedidos extends React.Component<ScreenProps<>> {

    state = {
      loading: true,
      pedidos: [],
      pedidosHistorial: [],
      refreshing: false,
      selectedPedidoId: "",
      selectedPQuantities: [],
      selectedDate: "",
      selectedTotalPrice: 0,
    }

    constructor(props) {
      super(props);
      this.open = this.open.bind(this);
    }

    @autobind
    async refreshPedidos(): Promise<void> {
      this.setState({refreshing: true});

      var user = Firebase.auth.currentUser;

      if (user == null) {
        return;
      }

      const query = await Firebase.firestore.collection("pedidos").where("user_id", "==", user.uid).get().catch(function(error) {
          console.log("Error getting documents: ", error);
      });
      const pedidos = [];
      const pedidosHistorial = [];
      query.forEach(doc => {
        if (doc.data().reclamado) {
          pedidosHistorial.push(doc.data());
        } else {
          pedidos.push(doc.data());
        }
      });

      var controllerInstance = Controller.getInstance();
      controllerInstance.pedidos = pedidos;
      this.props.store.pedidos = pedidos;
      console.log("AM HERE BOII ", controllerInstance.pedidos);

      this.setState({
        pedidos,
        pedidosHistorial,
        loading: false,
        refreshing: false,
      });
    }

    // async componentWillMount(): Promise<void> {
    //   await this.refreshPedidos().catch(function(error) {
    //     console.error("wadduppp: ", error);
    //   });
    // }

    componentDidMount() {
      console.log("HAYUUUU ", this.props.store.loading);
      var controllerInstance = Controller.getInstance();
      var pedidos = controllerInstance.pedidos;

      if (pedidos.length > this.state.pedidos.length) {
        this.setState({pedidos: pedidos});
      }
      JankWorkaround.runAfterInteractions(() => {
        this.setState({ loading: false });
      });
    }

    open(pedidoInfo) {
      // pass in info
      this.refreshPedidos();
      console.log("pedidoInfo is ", pedidoInfo);
      this.setState({selectedPedido: pedidoInfo});
      this.refs.pedidoModal.open();
    }

    @autobind
    dismissModal() {
      this.setState({isOpen: false});
    }

    // @autobind
    // pedidoHecho(pedido) {
    //   this.setState({pedidos: this.state.pedidos.push(pedido)});
    //   //store.pedidos.push(pedido);
    // }

    @autobind
    comprar() {
      this.refs.baseComponent.comprar();
    }

    render(): React.Node {
        console.log("rendering pedidos now too ", this.state.pedidos);
        //var pedidosArr = this.state.pedidos;
        var pedidosArr = this.props.store.pedidos;//Controller.getInstance().pedidos;
        console.log("historial: ", this.state.pedidosHistorial);

        //this.setState({pedidos: pedidosArr});

        return <BaseContainer ref="baseComponent" title="Pedidos" hasRefresh={true} refresh={this.refreshPedidos} navigation={this.props.navigation} >
                  <View>
                  {this.state.loading ? (
                    <Loading />
                  ) : (
                    <View>
                    <Button block style={style.compraButton} onPress={this.comprar}>
                      <H3>Nueva Compra</H3>
                    </Button>
                    <ScrollView refreshControl={
                        <RefreshControl
                          refreshing={this.state.refreshing}
                          onRefresh={this.refreshPedidos}/> }>
                    { this.props.store.pedidos.length > 0 ? (
                      <Separator style={style.divider}>
                        <Text style={{color: "white", fontWeight: "bold"}}>Pedidos a reclamar</Text>
                      </Separator>
                    ) : (<View>
                        <Text style={style.welcomeMessage}>Bienvenido/a, ahora eres parte de la familia OneFood.</Text>
                      </View>)}

                    {this.props.store.pedidos.map((item, key) =>  (
                      <ListItem key={key} style={{height: 70}} onPress={() => this.open(item)}>
                        <Text style={{color: "white"}}> {item.cantidades[0] + item.cantidades[1]} ONEFOODS</Text>
                      </ListItem>))
                    }

                    { this.state.pedidosHistorial.length > 0 ? (
                      <Separator style={style.divider}>
                        <Text style={{color: "white", fontWeight: "bold"}}>Historial de Pedidos</Text>
                      </Separator>
                    ) : (<View/>)}

                    {this.state.pedidosHistorial.map((item, key) =>  (
                      <ListItem key={key} style={{height: 70}}>
                        <Text style={Styles.grayText}> {item.cantidades[0] + item.cantidades[1]} ONEFOODS</Text>
                      </ListItem>))
                    }


                   </ScrollView>
                   </View>
                  )}
                  </View>
                  <PedidoDetalle ref={"pedidoModal"} pedidoInfo={this.state.selectedPedido} pedido_id={this.state.selectedPedidoId} fecha={this.state.selectedDate} cantidades={this.state.selectedPQuantities} precioTotal={this.state.selectedTotalPrice} user_id="rigo" al_mes="false" direccionAEntregar="Isla Dorada"/>
        </BaseContainer>;
    }
}

//{this.state.pedidos.forEach(pedido => <PedidoDetalle ref={"pedidoModal"} pedido_id={pedido.pedido_id} fecha={pedido.fecha} cantidades={pedido.cantidades} precioTotal={pedido.precio_total}/>)}

type PedidoProps = {
  pedido_id: string,
  fecha: string,
  cantidades: number[],
  sabores: string[],
  precioTotal: number,
  user_id: string,
  subscription: boolean,
  domicilio: string
}
class PedidoDetalle extends React.Component<PedidoProps> {
    state = {
      detailModalIsOpen: false,
    }

    open() {
      this.setState({detailModalIsOpen: true});
      //this.refs.modal.open();
    }

    @autobind
    setModalStateClosed() {
      this.setState({detailModalIsOpen: false});
    }

    @autobind
    dismissModal() {
      this.setState({detailModalIsOpen: false});
    }

    render(): React.Node {
      const {pedidoInfo, pedido_id, fecha, cantidades, precioTotal} = this.props;
      var pedidoId = 0;
      var chocolateQuantity = 0;
      var vanillaQuantity = 0;
      var pedidoFecha = "";
      if (pedidoInfo != undefined) {
        pedidoId = pedidoInfo.pedido_id;
        chocolateQuantity = pedidoInfo.cantidades[0];
        vanillaQuantity = pedidoInfo.cantidades[1];
        pedidoFecha = pedidoInfo.fecha;
      }


      return <Modal style={[style.modal, style.container]} onClosed={this.setModalStateClosed}  isOpen={this.state.detailModalIsOpen} backdrop={true} position={"bottom"} coverScreen={true} ref={"modal"}>
          <Button transparent onPress={this.dismissModal}>
              <Icon name="ios-close-outline" style={style.closeIcon} />
          </Button>
          <QRCode
                value={pedidoId}
                size={200}
                bgColor='purple'
                fgColor='white'/>
            <PedidoItem
                numero={chocolateQuantity}
                title="CHOCOLATE"
            />
            <PedidoItem
                numero={vanillaQuantity}
                title="VAINILLA"
            />
            <View style={{marginTop: 20}}>
              <H3>{pedidoFecha}</H3>
            </View>

        </Modal>;
    }
}

//  <Text>Entrega a domicilio</Text>
  //<Text>Polanco 4815, Torre 16, Numero 23\n 42, Ciudad de Mexico</Text>
const Loading = () => (
  <View style={style.container}>
    <Text></Text>
  </View>
);

type ItemProps = {
    title: string,
    pedido_id: string,
    done?: boolean
};

@observer
class Item extends React.Component<ItemProps> {
    @observable done: boolean;

    constructor(props) {
      super(props);
      this.open = this.open.bind(this);
    }
    componentWillMount() {
        const {done} = this.props;
        this.done = !!done;
    }

    @autobind @action
    toggle() {
        this.done = !this.done;
    }

    open() {
      this.refs.pedidoModal.open();
      //this.refs.pedido.open();
      //          <PedidoDetalle ref={"pedido"} pedido_id="rigo1" fecha="23/12/2017" cantidad="3" sabor="Chocolate" precioTotal="50" user_id="rigo" al_mes="false" direccionAEntregar="Isla Dorada"/>

    }

    render(): React.Node  {
        const {title} = this.props;
        const {pedido_id} = this.props;
        const txtStyle = this.done ? Styles.grayText : Styles.whiteText;
        return <View style={[Styles.listItem, { marginHorizontal: 0 }]}>
                    <View style={[Styles.center, style.title]}>
                        <Text style={txtStyle}>{title}</Text>
                    </View>
                </View>
    }
}

const {width} = Dimensions.get("window");

const style = StyleSheet.create({
    mask: {
        backgroundColor: "rgba(0, 0, 0, .5)"
    },
    button: {
        height: 75, width: 75, borderRadius: 0
    },
    compraButton: {
        height: 60,
    },
    closeIcon: {
        fontSize: 50,
        marginLeft: 20,
        color: variables.listBorderColor
    },
    number: {
        alignItems: "center",
        flexDirection: "row",
        padding: variables.contentPadding
    },
    divider: {
      backgroundColor: variables.listSeparatorBg,
      height: 40,
    },
    welcomeMessage: {
      color: "white",
      margin: 10,
      fontSize: variables.fontSizeBase * 2,
      marginTop: 15,
      fontStyle: "italic",
    },
    title: {
        justifyContent: "center",
        flex: 1,
        padding: variables.contentPadding
    },
    titleText: {
        fontSize: variables.fontSizeBase * 2 + variables.contentPadding,
        color: "white"
    },
    timelineLeft: {
        flex: .5,
        borderRightWidth: variables.borderWidth,
        borderColor: variables.listBorderColor
    },
    timelineRight: {
        flex: .5,
        justifyContent: "flex-end"
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
        paddingLeft: variables.contentPadding
    },
    modal: {
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: variables.brandSecondary
  },
});
