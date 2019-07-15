import * as Colors from './colors'
import * as Spacing from './spacing'

export const extraLargeFontSize = 32
export const extraLargeIconSize = 35
export const iconFontSize = 25;
export const largeFontSize = 24
export const buttonFontSize = 18
export const baseFontSize = 16
export const smallFontSize = 14
export const smallestFontSize = 10
export const largeHeaderFontSize = 20
export const headerFontSize = 18
export const ToolbarHeight = 44;

const base = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
}

export const link = {
  color: Colors.thoughtbotRed,
  fontWeight: 'bold',
}

export const bodyText = {
  color: Colors.baseText,
  fontSize: smallFontSize,
  lineHeight: 19,
}

export const headerText = {
  color: Colors.darkText,
  fontSize: headerFontSize,
  fontWeight: 'bold',
}

export const descriptionText = {
  color: Colors.baseText,
  fontSize: smallFontSize,
}

export const screenHeader = {
  ...base,
  color: Colors.baseText,
  fontSize: largeFontSize,
  fontWeight: 'bold',
}

export const screenFooter = {
  ...base,
  ...descriptionText,
}

export const sectionHeader = {
  ...base,
  ...headerText,
}

export const count = {
  ...base,
  ...descriptionText,
}


export const  container = {
  backgroundColor:Colors.appBackground,
  flex: 1,
}

export const listItems = {    
  flex:1,
}

export const  li = {
 
}

export const navbar = {
  width:50,
  alignItems: 'center',
  justifyContent: 'center',   
  height: ToolbarHeight,
  flexDirection: 'row',
  ...toolbar
}


export const navbarBody = {
  flex:1,
  alignItems: 'center',
  justifyContent: 'center',
  alignContent:'center',
  height: ToolbarHeight,

}

export const navbarTitle = {
  color:Colors.whitesmoke ,
  fontSize: baseFontSize,
  fontWeight: "500",
  textAlign:'center'
}

export const toolbar = {
  backgroundColor: Colors.primary,
  height: 44
}


export const actionText =  {
  color: Colors.white,
  fontSize: baseFontSize,
  textAlign: 'center'

}


export const action = {

}