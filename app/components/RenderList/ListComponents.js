import React from 'react'
import {FlatList,TouchableOpacity,StyleSheet,View,Image} from 'react-native'
import {Card,ListItem,Left,Body,Icon,Right} from 'native-base';
import {Colors, Typography} from '../../styles/index'
import moment from 'moment'
import { Text, Layout ,Input,Button} from 'react-native-ui-kitten';


export const ListWithIcon = (Prop)=>  (<FlatList
data={Prop.data}
renderItem={({item})=>
<Card style={styles.ListWithIconCardStyle}>
  <ListItem
    onPress={()=>Prop.onPress(item)}
    noBorder style={{backgroundColor:Colors.overLay}}>
        <Left style={styles.ListWithIconLeftStyle}>
           <Icon style={[{color:Prop.iconColor,transform:Prop.degree?[{rotate:Prop.degree},Typography.fonts]:[{rotate:"0deg"}]}]} name={Prop.iconLeftName}/>
        </Left>
        <TouchableOpacity onPress={()=>Prop.onPress(item)}>
        <Body>
            {
                Prop.showItem.map((val,index)=>
                  index == 0 ?
                  <Text style={[styles.ListWithIconBodyStyleName,Typography.fonts]}>{item[val]}</Text>
                  :
                  <Text style={[styles.ListWithIconKeyColor,Typography.fonts]}>{item[val]}</Text>
                )
            }
        </Body>
        </TouchableOpacity>
         { 
             //check if a Right item exist which is a bool
         
             Prop.RightItem ?
             <Right style={styles.ListWithIconRightStyle}>
                {
                  Prop.iconRightName && Prop.iconText?
                   <View>
                     <Icon style={{color:Prop.iconColor,transform:Prop.degree?[{rotate:Prop.degree}]:[{rotate:"0deg"}]}} name={Prop.iconRightName}/>
                     <Text style={[styles.ListWithIconRightText,Typography.fonts]} uppercase={false}>{item.price}</Text>
                  </View>
                    :
                    <Icon style={{color:Prop.iconColor,transform:Prop.degree?[{rotate:Prop.degree}]:[{rotate:"0deg"}]}} name={Prop.iconRightName}/>
                }
             </Right> :
             <View></View>  
         }
               
</ListItem>
</Card>
}
/>)

//usually used to show appointment
export const ListWithImage =  (Prop)=>  (<FlatList
    extraData={Prop.state?Prop.state:[]}
    data={Prop.data}
    style={{backgroundColor:Colors.white}}
    renderItem={({item})=>
             <Card style={styles.ListWithIconCardStyle}>
             <ListItem
               onPress={()=>Prop.onPress(item)}
               noBorder style={{backgroundColor:Colors.primary}}>
                   <Left style={[styles.ListWithIconLeftStyle,{maxWidth:50,width:50,marginRight:10}]}>
                          <View style={styles.ListWithImage}>
                                      { 
                                        //tenary operator that checks for docPhoto while rendering flatlist changes
                                         item.photo?
                                          <Image source={{uri:item.photo}} style={styles.imgRounded}/>
                                        :
                                         <View></View>
                                      }
       
                                      
                                      {
                                          //check if list implement a status feature
                                          Prop.status?
                                          <View style={[{backgroundColor:Prop.getBgColor(item)},styles.statusStyle]}></View>
                                         :<View></View>
                                      }
                                          
                          </View>
                   </Left>
                   <Body>
                        <TouchableOpacity style={{paddingLeft:10}} onPress={()=>Prop.onPress(item)}>
                           {
                               Prop.showItem.map((val)=>
                
                                  //nested tenary operator
                                    val == 'name'?
                                      <Text category="h2"  style={styles.headerText}>{item.name}</Text> 
                                      :
                                      
                                      <Text style={styles.text}>{item[val]}</Text>  
                               )
                           }   
                         </TouchableOpacity>

                         {
                             Prop.location?
                             <Button  textStyle={{fontSize:18,lineHeight:18}} status="success" style={{borderRadius:50,width:150,}} size="tiny">kaduna city</Button>:
                            <View></View>
                         }

                   
                   </Body>
                    { 
                        //check if a Right item exist which is a bool

                        
                        
                        <Right style={[styles.ListWithIconRightStyle,{width:200}]}>   
                        {
                                         Prop.dateRight?
                                           //nested tenary operator checks if date comes with yymmdd format seperately from db or together and pass to moment
                                           !Prop.format?
                                           <View>
                                              <Text style={styles.text}>{moment(item.date).format('L')}</Text>
                                              <Text style={styles.text}>{moment(item.date).fromNow()}</Text>
                                           </View>
                                           :
                                           <View>
                                                <Text style={styles.text}>{moment(item.date).format('L')}</Text>
                                                <Text style={styles.text}>{moment(item.date).fromNow()}</Text>
                                           </View>
                                           

       
                                          :
                                         <Text></Text>
                                     } 
                           {
                             Prop.iconRightName && Prop.iconText ?
                              <View style={styles.rightStyle}>
                                <Icon style={{color:Prop.iconColor,transform:Prop.degree?[{rotate:Prop.degree}]:[{rotate:"0deg"}]}} name={Prop.iconRightName}/>
                                <Text style={styles.ListWithIconRightText} uppercase={false}>{item[Prop.textPropertyName]}</Text>
                             </View>
                               :
                               <Icon style={{color:Prop.iconColor,transform:Prop.degree?[{rotate:Prop.degree}]:[{rotate:"0deg"}]}} name={Prop.iconRightName}/>
                           }
                           
                        </Right>   
                    }
                        
                          
           </ListItem>
           </Card>
    }
    />)

const styles = StyleSheet.create({
    ListWithIconCardStyle:{
        backgroundColor:Colors.primary,
        marginBottom:-3,
    },
    ListWithIconLeftStyle:{
        ...Typography.fonts,
        maxWidth:50,
        justifyContent:'center',
        alignContent:'center'
    },
    ListWithIconRightStyle:{
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'center'
    },
    ListWithIconBodyStyleName:{
        ...Typography.fonts,
        fontWeight:'bold',
        color:Colors.white
    },
    ListWithIconKeyColor:{
        color:Colors.white
    },
    ListWithIconRightText:{
        fontWeight:'bold',
        color:Colors.white,
        ...Typography.fonts
    },
    fonts:{
        fontFamily:'Oxygen-Regular'
    },

    //List with image style
    ListWithImage:{
        height:50,
        width:50,
        backgroundColor:Colors.white,
        borderRadius:100
    },
    statusStyle:{
        width:15,
        height:15,
        borderRadius:100,
        position:'absolute',
        bottom:0,
        right:5,
        borderWidth:3,
        borderColor:'#fff'
      }
      ,
      imgRounded:{
          height:50,
          width:50,
          borderRadius:100
        },

    headerText:{
        ...Typography.fonts,
        fontWeight:'100',
        color:Colors.white,
        fontSize:Typography.baseFontSize
    },
    text:{
        color:Colors.white,
        fontSize:11,
        marginBottom:2,
        fontWeight:'500',
        ...Typography.fonts
    }
    ,
    rightStyle:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    }

})