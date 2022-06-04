import sys
import librosa
import soundfile as sf
import numpy as np
from sklearn.preprocessing import StandardScaler
import umap

sr = 44100

sources = sys.argv[1]

audios = []

for source in sources.split( ',' ) :

    audio, _ = librosa.load( f'audio/{source}.wav', sr = sr, mono = True )
    audios.append( audio )

y = np.concatenate( audios, axis = 0 )
y = librosa.effects.harmonic( y )

print( f'Loaded {len( y )} samples' )

chunk_basis = 10
chunk_size = sr // chunk_basis

target_len = chunk_size * ( len( y ) // chunk_size )

y = y[:target_len]

print( f'Cropped to {target_len} samples' )

chunk_indices = np.arange( chunk_size, target_len, chunk_size, dtype = int )
# chunk_indices = librosa.onset.onset_detect( y = y, sr = sr, units = 'samples', backtrack = True )
chunks = np.split( y, chunk_indices, axis = 0 )

print( f'Split {len( chunks )} chunks' )

def get_features1( y ) :
    mfcc = librosa.feature.mfcc( y = y, sr = sr, n_fft = 256, n_mels = 16 )
    mfcc = np.mean( mfcc, axis = 1 )

    return mfcc

def get_features2( y ) :
    flatness = librosa.feature.spectral_flatness( y = y, n_fft = 256 )
    flatness = np.squeeze( flatness )

    return flatness

def get_features3( y ) :
    cent = librosa.feature.spectral_centroid( y = y, sr = sr, n_fft = 256 )
    cent = np.squeeze( cent )

    return cent

features = np.array( [get_features1( chunk ) for chunk in chunks] )
features = StandardScaler().fit_transform( features )

print( f'Extracted features with shape {features.shape}' )

reducer = umap.UMAP( n_components = 1, metric = 'euclidean' )
# reducer = PCA( n_components = 1 )

features = reducer.fit_transform( features )
features = np.concatenate( features, axis = 0 )

print( f'Reduced dimensions to shape {features.shape}' )

sorted_indices = np.argsort( features, axis = 0 )
sorted_chunks = [chunks[i] for i in sorted_indices]

y = np.concatenate( sorted_chunks, axis = 0 )

# kmeans = KMeans( n_clusters = 10, random_state = 0 ).fit( chunks )

sf.write( f'audio/{sources}.out.wav', y, sr, subtype = 'PCM_24' )
