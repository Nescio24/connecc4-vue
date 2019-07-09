import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.esm.browser.js'
import Board from './board.js'


let app = new Vue({
    el: "#app",
    props: [
        'rows',
        'cols',
        'holeRadius',
        'boardPadding',
        'pieceGap',
        'hoverHeight',
        'acceleration',
    ],
    propsData: {
        rows: 6,
        cols: 7,
        holeRadius: 20,
        boardPadding: 10,
        pieceGap: 10,
        hoverHeight: 10,
        acceleration: 1,
    },
    data: function() {
        return {
            hoverCol: null,
            board: new Board(this.rows, this.cols),
            animationState: null,
            awaitingInput: true,
        }
    },
    computed: {
        pieceRadius: function() {
            return this.holeRadius + 5
        },
        boardWidth: function() {
            return 2*this.pieceRadius*this.cols 
                + this.pieceGap*(this.cols - 1)
                + 2*this.boardPadding
        },
        boardHeight: function() {
            return 2*this.pieceRadius*this.rows 
                + this.pieceGap*(this.rows - 1)
                + 2*this.boardPadding
        },
        aboveBoard: function() {
            return 2*this.pieceRadius + this.hoverHeight
        },
        showHoveringPiece: function() {
            return this.hoverCol != null
                && this.board.isAvailableMove(this.hoverCol)
                && this.awaitingInput
        },
    },
    methods: {
        cx: function(col) {
            return this.boardPadding 
                + (2*col + 1)*this.pieceRadius
                + this.pieceGap*col
        },
        cy: function(row) {
            return this.aboveBoard
                + this.boardHeight
                - this.boardPadding
                - (2*row + 1)*this.pieceRadius
                - this.pieceGap*row
        },
        pieceID: function(isHuman) {
            if (isHuman) {
                return "#humanPiece"
            }
            else {
                return "#computerPiece"
            }
        },
        attemptMove: function(col) {
            if (this.awaitingInput) {
                this.awaitingInput = false

                // TODO: Make minimax run in parallel with animation
                // TODO: Use a web worker for computer player
                Promise.all([
                    this.animateDrop(col, true)
                        .then(() => {
                            let gameOver = this.board.makeMove(col, true)
                            console.log(gameOver)
                        }),
                ])
                    .then(() => {
                        this.awaitingInput = true
                    })
            }
        },
        animateDrop: function(col, isHuman) {
            return new Promise(resolve => {
                this.animationState = {
                    col: col,
                    currentCY: this.pieceRadius,
                    isHuman: isHuman,
                }
                let targetCY = this.cy(this.board.colHeight(col))
                let velocity = 0
                let animate = () => {
                    velocity += this.acceleration
                    this.animationState.currentCY += velocity
                    if (this.animationState.currentCY >= targetCY) {
                        this.animationState = null
                        resolve()
                    }
                    else {
                        requestAnimationFrame(animate)
                    }
                }
                requestAnimationFrame(animate)
            })
        },
    },
})
