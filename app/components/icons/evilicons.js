import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/EvilIcons'


export default class EvilIcons extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}