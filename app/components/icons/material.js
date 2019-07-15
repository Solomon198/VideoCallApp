import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'


export default class MaterialIcons extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}