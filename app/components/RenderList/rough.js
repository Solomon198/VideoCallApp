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
                <Button  textStyle={{fontSize:16,lineHeight:18}} status="success" style={{borderRadius:50,width:150,}} size="tiny">{item[Prop.locationProp]}</Button>:
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