import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/Entypo'


export default class Entypo extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}