import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/Feather'


export default class Feather extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}  