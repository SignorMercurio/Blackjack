<template>
  <q-page class="flex flex-center">
    <div class="col" v-if="started">
      <div>
        <q-card class="q-mb-md q-ml-md q-mr-md card-place">
          <q-card-section>
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">D</q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body1">Dealer</q-item-label>
                <q-item-label caption>
                  <q-badge>???</q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>

          <q-card-section class="q-gutter-sm">
            <img
              class="my-card"
              v-for="(card, index) in dealer.cards"
              :key="index"
              :src="'statics/' + card.suit + card.faceVal + '.jpg'"
            />
          </q-card-section>

          <q-inner-loading :showing="dealerLoading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>

      <div class="row">
        <q-card
          class="col q-mt-md q-ml-md q-mr-md card-place"
          v-for="(p, index) in player"
          :key="index"
        >
          <q-card-section>
            <q-item>
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">P</q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body1">Player</q-item-label>
                <q-item-label caption class="q-gutter-sm">
                  <q-badge>{{ p.point }}</q-badge>
                  <q-badge color="secondary">{{
                    'Current Bet: $' + bet
                  }}</q-badge>
                </q-item-label>
              </q-item-section>

              <q-item-section class="col-auto">
                <q-btn
                  push
                  color="primary"
                  label="Split"
                  @click="splitConfirm"
                  v-if="repeatNum && !splitted"
                ></q-btn>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  push
                  color="primary"
                  label="Hit"
                  @click="updatePlayer(index)"
                ></q-btn>
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn
                  push
                  color="primary"
                  label="Stay"
                  @click="updateDealer"
                ></q-btn>
              </q-item-section>
            </q-item>
          </q-card-section>

          <q-card-section class="q-gutter-sm">
            <img
              class="my-card"
              v-for="(card, index) in p.cards"
              :key="index"
              :src="'statics/' + card.suit + card.faceVal + '.jpg'"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog persistent v-model="resultDialog">
      <q-card>
        <q-card-section>
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left">Role</th>
                <th class="text-right">Hand</th>
                <th class="text-right">Income</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-left">Dealer</td>
                <td class="text-right">1</td>
                <td class="text-right">{{ dealer.income }}</td>
              </tr>
              <tr>
                <td class="text-left">Player</td>
                <td class="text-right">1</td>
                <td class="text-right">{{ player[0].income }}</td>
              </tr>
              <tr v-if="splitted">
                <td class="text-left">Player</td>
                <td class="text-right">2</td>
                <td class="text-right">{{ player[1].income }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            label="OK"
            v-close-popup
            @click="started = false"
          ></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="splitDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Split your cards</div>
        </q-card-section>

        <q-card-section>
          <q-list bordered separator>
            <q-slide-item
              v-for="(card, index) in selectable"
              :key="index"
              @left="onLeft(index)"
              @right="onRight(index)"
            >
              <template v-slot:left>
                <q-icon name="looks_two"></q-icon>
              </template>
              <template v-slot:right>
                <q-icon name="looks_one"></q-icon>
              </template>

              <q-item>
                <q-item-section>
                  <img
                    class="my-card"
                    :src="'statics/' + card.suit + card.faceVal + '.jpg'"
                  />
                </q-item-section>
              </q-item>
            </q-slide-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            label="OK"
            v-close-popup
            @click="split"
          ></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-sticky position="top-right" :offset="[18, 18]">
      <q-fab icon="add" direction="down" color="accent">
        <q-fab-action
          @click="startNewGame"
          color="primary"
          icon="play_circle_filled"
        >
          <q-tooltip anchor="center left" self="center right" :offset="[10, 10]"
            >Start a new game</q-tooltip
          >
        </q-fab-action>
        <q-fab-action @click="doubleBet" color="primary" icon="looks_two">
          <q-tooltip anchor="center left" self="center right" :offset="[10, 10]"
            >Double bet</q-tooltip
          >
        </q-fab-action>
        <q-fab-action @click="claim" color="primary" icon="new_releases">
          <q-tooltip anchor="center left" self="center right" :offset="[10, 10]"
            >Claim Victory!</q-tooltip
          >
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      money: 100,
      bet: 0,
      started: false, // if the game has started
      player: [
        {
          point: 0,
          cards: [],
          income: ''
        }
      ],
      dealer: {
        point: 0,
        cards: [],
        income: ''
      },
      d1suit: '', // suit of the first card of dealer
      d1face: 0, // faceVal of ...
      dealerLoading: false,
      resultDialog: false,
      /* for splitting */
      repeatNum: 0, // which faceVal is repeated
      selectable: [], // repeated cards excluded
      hand1: [],
      hand2: [],
      splitDialog: false,
      splitted: false
    }
  },
  created: function() {
    this.$axios.post('initGame')
  },
  methods: {
    err(msg) {
      this.$q.notify({
        message: msg,
        color: 'negative',
        icon: 'report_problem'
      })
    },
    ok(msg) {
      this.$q.notify({
        message: msg,
        color: 'positive',
        icon: 'check'
      })
    },
    updatePoints(role) {
      role.point = role.cards
        .map(el => el.value)
        .reduce((acc, cur) => acc + cur)
    },
    initDeck() {
      this.splitted = false
      this.repeatNum = 0
      this.player = [
        {
          point: 0,
          cards: [],
          status: '',
          income: ''
        }
      ]
      this.$axios.post('startNewGame', { bet: this.bet }).then(res => {
        this.dealer.cards = res.data.dealer
        this.player[0].cards = res.data.player1
        this.updatePoints(this.dealer)
        this.updatePoints(this.player[0])

        /* for first card flipping */
        this.d1suit = this.dealer.cards[0].suit
        this.d1face = this.dealer.cards[0].faceVal
        this.dealer.cards[0].suit = 'back'
        this.dealer.cards[0].faceVal = 0

        this.started = true

        if (res.data.canSplit !== 'false') {
          this.repeatNum = res.data.canSplit
        }
      })
    },
    startNewGame() {
      this.$q
        .dialog({
          title: 'Lay your bet!',
          message: 'How much would you like to bet this time?',
          prompt: {
            model: '',
            type: 'number'
          },
          cancel: true
        })
        .onOk(data => {
          this.bet = parseInt(data) //!
          if (!this.bet || this.bet > this.money || this.bet <= 0) {
            this.err('Please input a valid number!')
          } else {
            this.initDeck()
          }
        })
    },
    updateDealer() {
      this.dealerLoading = true
      this.$axios.post('updateDealer').then(res => {
        this.dealer.cards = res.data.dealer
        /* for first card flipping */
        this.dealer.cards[0].suit = 'back'
        this.dealer.cards[0].faceVal = 0
        this.dealer.point = res.data.sumVal
        if (res.data.sumVal === 'blackjack' || res.data.sumVal === 'boom') {
          this.claim()
        }

        setTimeout(() => {
          this.dealerLoading = false
        }, 200)
      })
    },
    updatePlayer(hand) {
      this.updateDealer() //!
      this.$axios.post('updateUser', { whichHand: hand }).then(res => {
        this.player[hand].cards = res.data.user
        this.player[hand].point = res.data.sumVal
        if (res.data.sumVal === 'blackjack' || res.data.sumVal === 'boom') {
          this.claim()
        } else if (res.data.canSplit !== 'false') {
          this.repeatNum = res.data.canSplit
        }
      })
    },
    doubleBet() {
      if (this.splitted) {
        this.err('You cannot double your bet after splitting!')
        return
      }
      this.$q
        .dialog({
          title: 'Double your bet!',
          message: 'Are you sure you want to double your bet?',
          cancel: true
        })
        .onOk(() => {
          if (this.bet * 2 > this.money) {
            this.err('You do not have enough money!')
          } else {
            this.$axios.post('doubleBet', { whichHand: 0 }).then(res => {
              this.bet = res.data.bet
              this.ok('Bet doubled!')
            })
          }
        })
    },
    claim() {
      if (!this.started) {
        this.err('The game has not started!')
        return
      }
      this.$axios
        .post('openCard', {
          dealer: this.dealer.point.toString(), //!
          hand1: this.player[0].point.toString(),
          hand2: this.splitted ? this.player[1].point.toString() : null
        })
        .then(res => {
          this.dealer.income = res.data.dealer0 + res.data.dealer1
          this.player[0].income = res.data.player0
          if (this.splitted) {
            this.player[1].income = res.data.player1
          }

          this.money +=
            res.data.player0 + (res.data.player1 ? res.data.player1 : 0)
          this.$root.$emit('money_change', this.money) // to HeaderOnly.vue
          /* reveal the first card */
          this.dealer.cards[0].suit = this.d1suit
          this.dealer.cards[0].faceVal = this.d1face
          this.resultDialog = true
        })
    },
    splitConfirm() {
      this.$q
        .dialog({
          title: 'Split your Cards!',
          message: 'Would you like to split your cards?',
          cancel: true,
          persistent: true //!
        })
        .onOk(() => {
          this.selectable = []
          this.hand1 = []
          this.hand2 = []
          this.player[0].cards.forEach(elem => {
            if (elem.faceVal !== this.repeatNum) {
              this.selectable.push(elem)
            } else {
              // 2 repeated cards will be pushed into hand1 & hand2 respectively
              this.hand1.length ? this.hand2.push(elem) : this.hand1.push(elem)
            }
          })
          this.splitDialog = true
        })
    },
    onLeft(index) {
      this.hand2.push(this.selectable[index]) // hand2, not 1
    },
    onRight(index) {
      this.hand1.push(this.selectable[index])
    },
    split() {
      console.log(this.hand1)
      console.log(this.hand2)
      this.$axios
        .post('splitHand', {
          hand1: this.hand1,
          hand2: this.hand2
        })
        .then(() => {
          this.player[0].cards = this.hand1
          this.updatePoints(this.player[0])
          this.player.push({
            point: 0,
            cards: this.hand2
          })
          this.updatePoints(this.player[1])

          this.splitted = true
        })
    }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  height: 100%
  max-width: 105px
  max-height: 150px

.card-place
  background: rgba(255,255,255,.6)
</style>
