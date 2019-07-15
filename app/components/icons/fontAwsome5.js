import React,{Component} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5'


export default class FontAwsome5 extends Component {
    render(){
        return(
            <Icon name={this.props.name} style={this.props.style}/>
        )
    }
}