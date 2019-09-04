import React, { Component } from 'react';
function okay (){
<div className="App">
<a href='http://localhost:8888'>Login to Spotify </a>
<div id="Track Name" style={{display:'none'}}>
  Now Playing: { this.state.nowPlaying.name }
</div> 
<div>
  Artist: {this.state.nowPlaying.artist }
</div>
<div>
  Album: {this.state.nowPlaying.albumName}
</div>
<div>
  <img src={this.state.nowPlaying.albumArt} style={{ height: 250 }}/>
</div>

<div>
  Track Tempo : {this.state.information.tempo} 
</div>
<div>
  Tempo Confidence: {this.state.information.tempoconfidence}
</div>
<div>
  Key: {this.state.information.key }
</div>
<div>
  Mode: {this.state.information.mode}
</div>
 <div>
  Dance: {this.state.trackFeatures.dance }
</div>
<div>
  Acoustics: {this.state.trackFeatures.acoustic }
</div>
<div>
  Energy: {this.state.trackFeatures.energy }
</div>
<div>
  Valence {this.state.trackFeatures.valence}
</div>
<div>
  Popularity {this.state.trackPopularity.popular }
</div>
<div>
  Genre {this.state.artistInfo.genre }
</div>
<div>
  recommendedTrack {this.state.recommend.trackname}
</div>
<div>
  artist {this.state.recommend.artist}
</div>

{ this.state.loggedIn &&
  <button onClick={() => this.getNowPlaying()}>
    Check Now Playing
  </button>
}
<br></br>
 {/* { this.state.loggedIn &&
  <button onClick={() => this.getCurrentArtistAlbums()}>
    Get Artist Albums
  </button>
} */}
<br></br>
{ this.state.loggedIn &&
  <button onClick={() => this.getTrackInfo() & this.getTrackFeatures()& this.getPopularity() & this.getArtistInfo() & this.getARecommendedTrack()}>
    Get Info
  </button>
}
</div>
};
okay();