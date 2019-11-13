//react-native-rating-changes 
//TapRating.js

// import _ from 'lodash';

// import React, { Component } from 'react';
// import PropTypes from 'prop-types';

// import { StyleSheet, Text, View } from 'react-native';

// import Star from './components/Star'

// export default class TapRating extends Component {
//   static defaultProps = {
//     defaultRating: 3,
//     reviews: ["Terrible!", "Bad!", "Okay!", "Good!", "Great!"],
//     count: 5,
//     onFinishRating: () => console.log('Rating selected. Attach a function here.'),
//     showRating: true
//   };

//   constructor() {
//     super()

//     this.state = {
//       position: 5
//     }
//   }

//   componentDidMount() {
//     const { defaultRating } = this.props

//     this.setState({ position: defaultRating })
//   }

//   componentWillReceiveProps(nextProps) {
//     if (nextProps.defaultRating !== this.props.defaultRating) {
//       this.setState({ position: nextProps.defaultRating })
//     }
//   }

//   renderStars(rating_array) {
//     return _.map(rating_array, (star, index) => {
//       return star
//     })
//   }

//   starSelectedInPosition(position) {
//     const { onFinishRating } = this.props

//     onFinishRating(position);

//     this.setState({ position: position })
//   }

//   render() {
//     const { position } = this.state
//     const { count, reviews, showRating } = this.props
//     const rating_array = []

//     _.times(count, index => {
//       rating_array.push(
//         <Star
//           key={index}
//           position={index + 1}
//           starSelectedInPosition={this.starSelectedInPosition.bind(this)}
//           fill={position >= index + 1}
//           {...this.props}
//         />
//       )
//     })

//     return (
//       <View style={styles.ratingContainer}>
       
//         <View style={styles.starContainer}>
//           {this.renderStars(rating_array)}
//         </View>
//         { showRating &&
//           <Text style={styles.reviewText}>
//             {reviews[position - 1]}
//           </Text>
//         }
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   ratingContainer: {
//     backgroundColor: 'transparent',
//     flexDirection: 'column',
//     justifyContent: 'center',
//   },
//   reviewText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     margin: 10,
//     color: 'gray'
//   },
//   starContainer: {
//     flexDirection: 'row',
//   }
// });


//





//components/start.js
// import React, {PureComponent} from 'react';
// import {StyleSheet, Animated, TouchableOpacity} from 'react-native';

// const STAR_IMAGE = require( '../images/airbnb-star.png' );
// const STAR_SELECTED_IMAGE = require( '../images/airbnb-star-selected.png' );
// const STAR_SIZE = 40;

// export default class Star extends PureComponent {
//   static defaultProps = {
//     selectedColor: '#1a73e8'
//   };

//   constructor() {
//     super();
//     this.springValue = new Animated.Value( 1 );

//     this.state = {
//       selected: false
//     };
//   }

//   spring() {
//     const { position, starSelectedInPosition } = this.props;

//     this.springValue.setValue( 1.2 );

//     Animated.spring(
//       this.springValue,
//       {
//         toValue: 1,
//         friction: 2,
//         tension: 1
//       }
//     ).start();

//     this.setState( { selected: !this.state.selected } );
//     starSelectedInPosition( position );
//   }

//   render() {
//     const { fill, size, selectedColor, isDisabled } = this.props;
//     const starSource = fill && selectedColor === null ? STAR_SELECTED_IMAGE : STAR_IMAGE;

//     return (
//       <TouchableOpacity activeOpacity={1} onPress={this.spring.bind( this )} disabled={isDisabled}>
//         <Animated.Image
//           source={starSource}
//           style={[
//             styles.starStyle,
//             {
//               tintColor: fill && selectedColor ? selectedColor : undefined,
//               width: size || STAR_SIZE,
//               height: size || STAR_SIZE,
//               transform: [{ scale: this.springValue }]
//             }
//           ]}
//         />
//       </TouchableOpacity>
//     );
//   }
// }

// const styles = StyleSheet.create( {
//   starStyle: {
//     margin: 3
//   }
// } );
