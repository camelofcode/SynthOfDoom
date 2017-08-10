interface IMultiInputAudioNodeComponent {
    inputs(): Array<AudioNode>;
    output(): AudioNode;
}