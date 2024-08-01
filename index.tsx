import {Modal, SafeAreaView, View, Text, Platform} from "react-native";
import QRCode from "react-native-qrcode-svg";
import PrimaryButton from "@/components/primaryButton/primaryButton";
import * as Print from 'expo-print';
import { useContext, useState } from "react";
import { Printer, OrientationType } from "expo-print";
import MainContext from "@/context/mainContext";

type QrCodeProps = {
  value: string;
  isVisible: boolean;
  onClose: () => void;
}


export default function QrCodeModal({value, isVisible, onClose}:QrCodeProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<Printer>();
  const state = useContext(MainContext)
  const garage = state.user?.garage
  const imgDimension = Platform.OS === 'ios' ? 110 : 90;

  const html = `<html style="border: 2px solid black;">
<head>
<style>
      * { print-color-adjust:exact !important; }
</style>
</head>
    <body>
      <div style="display:flex; flex-direction: column;">
        <img src="data:image/jpeg;base64,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"
        alt="" title="logo" width=100 height=80/>
        <img id='barcode' src="https://api.qrserver.com/v1/create-qr-code/?data=${value}" width=${imgDimension} height=${imgDimension} />
      </div>
    </body>
  </html>`

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    console.log("printer", printer)
    // @ts-ignore
    setSelectedPrinter(printer);
  };

  const handlePrint = async () => {
    await Print.printAsync({
      html: html,
      height: printerHeight,
      width: 109,
      orientation: 'portrait',
      margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });
  }

  return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
      >
        <SafeAreaView style={{flex: 1, alignItems: "center", justifyContent: "space-between"}}>
          <QRCode
            value={value}
            size={300}
            color="black"
          />
          <View style={{flexDirection: "row", width: "100%", justifyContent: "center", paddingHorizontal: 20, marginBottom: 80}}>
            <PrimaryButton handleSubmit={handlePrint} title={"Print"} customStyle={{width: "40%"}}/>
            <PrimaryButton handleSubmit={onClose} title={"Close"} customStyle={{width: "40%", marginLeft: 20}}/>
            {!selectedPrinter && <PrimaryButton handleSubmit={selectPrinter} title={"Stampac"} customStyle={{width: "40%", marginLeft: 20}}/>}
          </View>
        </SafeAreaView>
      </Modal>
  )
}
