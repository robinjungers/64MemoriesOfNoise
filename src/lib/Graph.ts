import { lerp, minMaxScale, shrinkArray } from '../lib/utils';

const COLOR_BACKGROUND = 'hsl(0,0%,80%)';
const COLOR_GRAPH = 'hsl(0,0%,10%)';

export default class Graph {
    private ctx : CanvasRenderingContext2D;

    constructor( canvas : HTMLCanvasElement ) {
        this.ctx = canvas.getContext( '2d' )!;
    }

    resize( w : number, h : number, dpr : number ) {
        const { canvas } = this.ctx;
        canvas.style.backgroundColor = COLOR_BACKGROUND;
        canvas.width = dpr * w;
        canvas.height = dpr * h;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
    }

    draw( array :  Float32Array ) {
        const w = this.ctx.canvas.width;
        const h = this.ctx.canvas.height;

        this.ctx.clearRect( 0, 0, w, h );
        
        const maxLength = Math.floor( w / 4 );
        const newArray = array.length <= maxLength ? array : shrinkArray( array, maxLength );
        const newScaledArray = minMaxScale( newArray );

        const minY = 0.1 * h;
        const maxY = 0.9 * h;

        newScaledArray.forEach( ( value, i ) => {
            const blockX = lerp( i, 0, newScaledArray.length, 0.0, w );
            const blockY = lerp( value, 0.0, 1.0, maxY, minY );
            const blockW = lerp( 1, 0, newScaledArray.length, 0.0, w );
            const blockH = lerp( value, 0.0, 1.0, minY, maxY );

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect( blockX, blockY, blockW, blockH );
            this.ctx.fillStyle = COLOR_GRAPH;
            this.ctx.fill();
            this.ctx.restore();
        } );
    }

    destroy() {

    }
}