/*Note: Because of 'request' limitations, i am going to be using a button to get requests, rather than getting them*/ 
import React, { Component } from 'react';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import Player from "./Player";

var globalID;
var tracksleftinlabel;
var totaltracksinlabel;
var offset = 0;
var stupidvar;
var stupidvarnext;
var sawitch = 0;
var labelAlbums = {
  labelAlbumList : []
};
var allalbums = [];
var poplist = [];
var albumtracklist = [];


/* Creates a json of access and refresh tokens */
function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
  q = window.location.hash.substring(1);
  e = r.exec(q)
  while (e) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
    e = r.exec(q);
  }
  
  return hashParams;
}

//MergeSort of popularity
function sortByPopularity(array){
  if(array.length < 2){
    return array;
  }
  var mid = Math.floor(array.length/2);
  var subLeft = sortByPopularity(array.slice(0,mid));
  var subRight = sortByPopularity(array.slice(mid));
  return merge(subLeft, subRight);
  }

function merge(node1, node2){
  var result = [];
  while(node1.length > 0 && node2.length > 0){
    result.push(node1[0].popularity < node2[0].popularity? node1.shift() : node2.shift());
  }
  return result.concat(node1.length? node1 : node2);
  }

const params = getHashParams(); 
const token = params.access_token;
const spotifyApi = new SpotifyWebApi();

/*This class will GET data from spotify using XML API calls to its database */
class Retrieve extends React.Component {
constructor(){
super(); 

if (token) {
  spotifyApi.setAccessToken(token);
}

this.state = {
  loggedIn: token ? true : false,
  nowPlaying: { name: '', albumArt: '', artist:'', albumName: '', artistId: '', trackId: '',albumID: '' },
  information: {tempo: '', tempoconfidence: '', key:'', mode:''},
  artistInfo: {genre:''},
  trackFeatures: {dance:'', acoustic:'', energy:'', valence:''},
  trackPopularity: {popular:''},
  similarArtists: {artists:''},
  albumInfo:{albumInfo:''},
  albumsFromLabel:{albumlist:''},  
  albumIDList:{albumIDs: [] },
  albumPopList:{albumPops: [] },
  albumPopPlaceHolder:{POP:'', ID:''},
  albumTrackList:{tracklist:[]},
  recommend: {trackname : ' ', artist: ' ',trackID:''},
  recommendedAlbums : { albums:''},
  recommendedPopularity:{ popular:'' },
  // albumsFromLabelWithPopularity:{ id : '', images: '', name: '', popularity:''},
  showMe: true,
  duration_ms:0,
  progress_ms:0
}
} 
  getNowPlaying(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET','https://api.spotify.com/v1/me/player/currently-playing');
  xhr.setRequestHeader('Accept','application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send();
  xhr.onload = function processsRequest(e){
    var response = JSON.parse(xhr.responseText);
    this.setState({
    
      nowPlaying: {
            name: response.item.name, 
            albumArt: response.item.album.images[0].url,
            artist: response.item.artists[0].name,
            albumName: response.item.album.name,
            artistId: response.item.artists[0].id,
            trackId: response.item.id,
            albumID: response.item.album.id
        }
      
    });
  }.bind(this)
  }
  getAlbumInfo(){
  var currentAlbum = this.state.nowPlaying.albumID;
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET','https://api.spotify.com/v1/albums/'+ currentAlbum);
  xhr.setRequestHeader('Accept','application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send();
  xhr.onload = function processRequest(e){
    var response = JSON.parse(xhr.responseText);
    this.setState({
      albumInfo: {
        albumInfo : response
      }
  });

}.bind(this)
  }
  getTrackInfo(){
  var currentTrackID = this.state.nowPlaying.trackId;
  var xhr = new XMLHttpRequest();

  xhr.open('GET', "https://api.spotify.com/v1/audio-analysis/"+currentTrackID);
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send();
  xhr.onload = function processRequest(e){
    var response = JSON.parse(xhr.responseText);
    this.setState({
      
      information:{
              tempo: response.track.tempo,
              tempoconfidence: response.track.tempo_confidence,
              key: response.track.key,
              mode: response.track.mode
      
    }
    });
  }.bind(this)
  } 
  getArtistInfo(){
  var currentArtistID = this.state.nowPlaying.artistId;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "https://api.spotify.com/v1/artists/"+currentArtistID);
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send();
  xhr.onload = function processRequest(e){
    var response = JSON.parse(xhr.responseText);
    this.setState({
      
      artistInfo:{
              genre: response.genres
               
              }
             });
    }.bind(this)
  }
  getTrackFeatures(){
    var currentTrackID = this.state.nowPlaying.trackId; 
    var xhr = new XMLHttpRequest();
    xhr.open('GET','	https://api.spotify.com/v1/audio-features/'+currentTrackID);
    xhr.setRequestHeader('Accept','application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send();
    xhr.onload = function processRequest(e){
      var response = JSON.parse(xhr.responseText);
      this.setState({
        
        trackFeatures:{
          dance: response.danceability,
          acoustic: response.acousticness,
          energy: response.energy,
         valence: response.valence
        
      }
      });
    }.bind(this)
    
  }
  getPopularity(){
    var currentTrackID = this.state.nowPlaying.trackId;
   
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://api.spotify.com/v1/tracks/"+currentTrackID);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send();

    xhr.onload = function processRequest(e){
      var response = JSON.parse(xhr.responseText);
      this.setState({
       
        trackPopularity:{
                popular:response.popularity
       
      }
      });
    }.bind(this)
  }
  getARecommendedTrack(){
    var currentTrackID = this.state.nowPlaying.trackId;
    var currentArtistId = this.state.nowPlaying.artistId;
    var currentGenre = this.state.artistInfo.genre[0];
    var currentKey = this.state.information.key;
    var currentMode = this.state.information.mode;
    var currentTempo = this.state.information.tempo;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.spotify.com/v1/recommendations?limit=100&max_popularity=20&seed_genres' + currentGenre + '&seed_tracks='+currentTrackID);
    xhr.setRequestHeader('Accept','application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send();
    xhr.onload = function processRequest(e){

      var response = JSON.parse(xhr.responseText);
      
      this.setState({
       
        recommend: {
          trackname :response.tracks[0].name,
          artist: response.tracks[0].artists[0].name,
          trackID : response.tracks[0].id,
          artistID: response.tracks[0].artists[0].id,
          reclist : response.tracks

       
      }
      });

    }.bind(this)
    
  }
  getRecommenedAlbum(){
  var recArtistId = this.state.recommend.artistID;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.spotify.com/v1/artists/'+recArtistId+'/albums');
  xhr.setRequestHeader('Accept','application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send();
  xhr.onload = function processRequest(e){

    var response = JSON.parse(xhr.responseText);
    this.setState({
      recommendedAlbums:{
        albums: response.items
      }

    });
  }.bind(this)
  }
  getRecommendedTrackStats(){
    
    var recommendedTrackID = this.state.recommend.trackID;
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://api.spotify.com/v1/tracks/"+recommendedTrackID);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send();

    xhr.onload = function processRequest(e){
      var response = JSON.parse(xhr.responseText);
      this.setState({

        recommendedPopularity:{
                popular:response.popularity
       
      }
      });
    }.bind(this)
  
  } 
  getSimilarArtist(){
   var currentArtistID = this.state.nowPlaying.artistId;

   var xhr = new XMLHttpRequest();
   xhr.open('GET', 'https://api.spotify.com/v1/artists/' + currentArtistID + '/related-artists');
   xhr.setRequestHeader('Authorization', 'Bearer ' + token);
   xhr.send();
   xhr.onload = function processRequest(e){

    var response = JSON.parse(xhr.responseText);
    this.setState({
      similarArtists:{
        similarArtists : response.artists
      }
    });
   }.bind(this)

  }
  getnumberofTracks(){
    var currentLabel = (this.state.albumInfo.albumInfo.label).split(' ').join('%20');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.spotify.com/v1/search?q=label:"' + currentLabel + '"&type=album&limit=50&offest='+offset);
    xhr.setRequestHeader('Accept','application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send();  
    xhr.onload = function processRequest(e){
      var response = JSON.parse(xhr.responseText);
      totaltracksinlabel = response.albums.total;
      stupidvar = 'https://api.spotify.com/v1/search?q=label:"' + currentLabel + '"&type=album&limit=50&offest='+offset;
      stupidvarnext = response.albums.next;
    }

  }
  searchALabel(){
   
   
    var currentLabel = (this.state.albumInfo.albumInfo.label).split(' ').join('%20');
    var xhr = new XMLHttpRequest();
   
    // console.log('offset : ' + offset);
    xhr.open('GET', stupidvar);
    xhr.setRequestHeader('Accept','application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send();  
    xhr.onload = function processRequest(e){

      var response = JSON.parse(xhr.responseText);
     
      for(var i = 0 ; i < response.albums.items.length; i++){
   
        allalbums.push(response.albums.items[i]);
      }
      
    //   this.setState({
    //   albumsFromLabel:{
    //     albumlist: response
    //   }
    // });
    
    offset +=50;


    console.log(allalbums);
    console.log(allalbums.length);
   if (totaltracksinlabel > 50 ){
     
     totaltracksinlabel -= 50;
     stupidvar = response.albums.next;
     
     this.searchALabel();
   }


  }.bind(this)


  }

  getAlbumTracks(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.spotify.com/v1/albums/' + globalID + '/tracks?limit=50');
    xhr.setRequestHeader('Accept','application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.send();
    xhr.onload = function processRequest(e){
      var response = JSON.parse(xhr.responseText);
      for(var i = 0 ; i < response.items.length; i++){

      albumtracklist.push(response.items[i].name);
      this.setState({
        albumTrackList: {tracklist: this.state.albumTrackList.tracklist.concat(response.items[i].name)},
        
      });
    }
  }.bind(this)
}
  getPopularityForLabel(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.spotify.com/v1/albums/' + globalID);
  xhr.setRequestHeader('Accept','application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send();
  xhr.onload = function processRequest(e){
    var response = JSON.parse(xhr.responseText);
    poplist.push(response.popularity)
    this.setState({
      albumPopList:{albumPops: this.state.albumPopList.albumPops.concat(response.popularity) },

    });
  }.bind(this)
  }
  getNewJSONTags(){
  labelAlbums = {
    labelAlbumList : []
  };
 var listofAlbumsFromLabel = allalbums;
 var listofAlbumPop = this.state.albumPopList.albumPops;
 var currentTracksList = this.state.albumTrackList.tracklist;
 var i;
 var iter = 0;
 for(i = 0; i < listofAlbumsFromLabel.length;i++){
  
   var currentAlbumID = listofAlbumsFromLabel[i].id;
   globalID = currentAlbumID;
   
   this.getPopularityForLabel();
   this.getAlbumTracks();
   var currentArtist = listofAlbumsFromLabel[i].artists[0].name;
   var currentAlbumImages = listofAlbumsFromLabel[i].images;
   var currentAlbumName = listofAlbumsFromLabel[i].name;
   var currentAlbumPop = listofAlbumPop[i];
   var currentAMT = //make a list of current amt of tracks
   labelAlbums.labelAlbumList.push({
     "id" : currentAlbumID,
     "images" : currentAlbumImages,
     "artist":  currentArtist,
     "album name" : currentAlbumName,
     "popularity" : currentAlbumPop,
     "tracks" : currentTracksList
   });
    // reset it.
   
 }
 console.log(labelAlbums);
  }

}



class App extends Retrieve{
  // hideOrShowCurrent(){  
  //   var currentSong = this.state.nowPlaying.name;
  //   var currentArtist = this.state.nowPlaying.artist;
  //   var currentImage = this.state.nowPlaying.albumArt;
  //   return <h1 id='Track Name'>{currentSong + " by " + currentArtist  } <br></br> <img src ={currentImage} style={{ height: 250 }}/> </h1> ;
  // }
  operation(){
    this.setState({
      showMe:!this.state.showMe
    })
  }
  audioFeaturesOfCurrentTrack(){
    var currentTempo = this.state.information.tempo;
    var currentKey = this.state.information.key;
    var currentMode = this.state.information.mode;
    var currentPopularity = this.state.trackPopularity.popular;
    var currentTempoConfidence = this.state.information.tempoconfidence;
    var currentDance = this.state.trackFeatures.dance;
    return <h2>Current Tempo : {currentTempo + " Confidence: " + currentTempoConfidence * 100 + "%"} <br></br>
               Dance : {currentDance *100 + "%"} <br></br>
               Current Key : {currentKey} <br></br>
               Current Mode: {currentMode} <br></br>
               Current Popularity: {currentPopularity}</h2>
  }
  findASimilarTrack(){
    var recommenedTrackName = this.state.recommend.trackname;
    var recommenedArtistName = this.state.recommend.artist;
    var recommendedTrackPopularity = this.state.recommendedPopularity.popular;
    return <h6>Recommened Track : {recommenedTrackName + " by " + recommenedArtistName} <br></br>   </h6>
  }
  // componentDidMount(){
  //   // const script = document.createElement("script");

  //   // script.src = "https://sdk.scdn.co/spotify-player.js";
  //   // script.async = true;
    
  //   // document.body.appendChild(script)
  // }
  render(){
    return (
        <div className="App"> 
          <header className="App">
          <Player 
            currentlyPlaying={this.state.nowPlaying}
            currentlyPlayingInfo={this.state.information}
            currentTrackFeatures={this.state.trackFeatures}
            // recommendedArtist={this.state.similarArtists}
            progress_ms={this.progress_ms}
            sometoken = {token}
          /> 
          </header>
           {/* <a href='http://localhost:8888' > Login to Spotify </a> */} 
          {/* {
            this.state.showMe ?
            <div>
            {this.hideOrShowCurrent()}
           </div>  
           : null
          } */}
          {/* <br></br>
          <div>
          {this.audioFeaturesOfCurrentTrack()}
          </div> */}
         
          {/* <div>{this.findASimilarTrack()}</div>
           { this.state.loggedIn &&
          <button onClick={() => this.operation()}>
            Click Here to Hide Current Track
          </button>
           }
           <br></br> */}
          {this.state.loggedIn &&
          <button onClick={() => this.getNowPlaying()}>
            Click to get info
          </button>
          }
        {this.state.loggedIn &&
        <button onClick={() => this.getAlbumInfo()}>
          Click here after clicking on info
        </button>
        
        }
       
        {/* {this.state.loggedIn &&
        <button onClick = {() => this.getRecommenedAlbum()}>
          Click to get recommend
        </button>

          /* <br></br>
        {this.state.loggedIn &&
        <button onClick={() => this.getARecommendedTrack()}>
          Click to get a similar track
        </button>
        } */} 
         <button onClick={() => this.getnumberofTracks()}>
          Get Number of Tracks
        </button>
       <button onClick={() => this.searchALabel()}>
          Search A Label
        </button>
        <button onClick={() => this.getNewJSONTags()}>
          Get New Jsons
        </button>

         <button onClick={() => console.log(this.state.albumPopList.albumPops)}>
          Click
        </button>
        <button onClick={() => console.log(sortByPopularity(labelAlbums.labelAlbumList))}>
          Click
        </button>

       
      
        
        


        </div>
        
    );
    }
  }

export default App;



//Popularity:{recommendedTrackPopularity}







