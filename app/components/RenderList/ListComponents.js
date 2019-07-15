import React from 'react'
import {FlatList,TouchableOpacity,StyleSheet,View,Text,Image} from 'react-native'
import {Card,ListItem,Left,Body,Icon,Right} from 'native-base';
import {Colors, Typography} from '../../styles/index'
import moment from 'moment'


export const ListWithIcon = (Prop)=>  (<FlatList
data={Prop.data}
renderItem={({item})=>
<Card style={styles.ListWithIconCardStyle}>
  <ListItem
    onPress={()=>Prop.onPress(item)}
    noBorder style={{backgroundColor:Colors.overLay}}>
        <Left style={styles.ListWithIconLeftStyle}>
           <Icon style={{color:Prop.iconColor,transform:Prop.degree?[{rotate:Prop.degree}]:[{rotate:"0deg"}]}} name={Prop.iconLeftName}/>
        </Left>
        <TouchableOpacity onPress={()=>Prop.onPress(item)}>
        <Body>
            {
                Prop.showItem.map((val,index)=>
                  index == 0 ?
                  <Text style={styles.ListWithIconBodyStyleName}>{item[val]}</Text>
                  :
                  <Text style={styles.ListWithIconKeyColor}>{item[val]}</Text>
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
                     <Text style={styles.ListWithIconRightText} uppercase={false}>{item.price}</Text>
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
    renderItem={({item})=>
    <Card style={styles.ListWithIconCardStyle}>
      <ListItem
        onPress={()=>Prop.onPress(item)}
        noBorder style={{backgroundColor:Colors.overLay}}>
            <Left style={[styles.ListWithIconLeftStyle,{maxWidth:50,width:50}]}>
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
                      

                          val == 'date' || val == 'time'  ?
                          <View>
                              {
                                  val == 'date'?
                                    //nested tenary operator checks if date comes with yymmdd format seperately from db or together and pass to moment
                                    !Prop.format?
                                    <Text style={styles.text}>{moment({year:item.date.y,month:item.date.m,day:item.date.d,hour:item.time.h,minute:item.time.m}).format('LLLL')}</Text>
                                    : <Text style={styles.text}>{moment(JSON.parse(item.date)).format('LLLL')}</Text>

                                   :
                                    <Text style={styles.text}>{moment({year:item.date.y,month:item.date.m,day:item.date.d,hour:item.time.h,minute:item.time.m}).fromNow()}</Text>
                              }    
                          </View>
                         
                          :
                             //nested tenary operator
                             val == 'name'?
                               <Text style={styles.headerText}>{item.name}</Text> 
                               :
                               
                               <Text style={styles.text}>{item[val]}</Text>  
                        )
                    }   
                  </TouchableOpacity>
            
            </Body>
             { 
                 //check if a Right item exist which is a bool
            
                 Prop.rightItem ?
                 <Right style={[styles.ListWithIconRightStyle,{maxWidth:50,width:50}]}>
                    {
                      Prop.iconRightName && Prop.iconText ?
                       <View style={styles.rightStyle}>
                         <Icon style={{color:Prop.iconColor,transform:Prop.degree?[{rotate:Prop.degree}]:[{rotate:"0deg"}]}} name={Prop.iconRightName}/>
                         <Text style={styles.ListWithIconRightText} uppercase={false}>{item[Prop.textPropertyName]}</Text>
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

const styles = StyleSheet.create({
    ListWithIconCardStyle:{
        backgroundColor:Colors.overLay,
        marginBottom:-3,
        borderColor:Colors.overLay
    },
    ListWithIconLeftStyle:{
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
        fontWeight:'bold',
        color:Colors.baseText
    },
    ListWithIconKeyColor:{
        color:Colors.baseText
    },
    ListWithIconRightText:{
        fontWeight:'bold',
        color:Colors.baseText
    },

    //List with image style
    ListWithImage:{
        height:50,
        width:50,
        backgroundColor:Colors.lightGray,
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
        fontWeight:'bold',
        color:Colors.baseText,
        fontSize:Typography.baseFontSize
    },
    text:{
        color:Colors.baseText,
        fontSize:Typography.smallFontSize
    }
    ,
    rightStyle:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    }

})