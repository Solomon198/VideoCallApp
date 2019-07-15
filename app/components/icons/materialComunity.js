import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'


export default class MaterialCommunityIcons extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}