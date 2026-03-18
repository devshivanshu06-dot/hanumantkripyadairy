const User = require('../models/User');

exports.addAddress = async (req, res) => {
  try {
    const { label, addressLine1, addressLine2, landmark, city, state, pincode, isDefault, coordinates } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(a => a.isDefault = false); // reset others
    }

    const newAddress = {
      label: label || 'Home',
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      coordinates,
      isDefault: isDefault || user.addresses.length === 0
    };

    user.addresses.push(newAddress);
    
    // Update the legacy string address to match the default
    const defAddr = user.addresses.find(a => a.isDefault);
    if (defAddr) {
      user.address = `${defAddr.addressLine1}, ${defAddr.addressLine2 ? defAddr.addressLine2 + ', ' : ''}${defAddr.landmark ? defAddr.landmark + ', ' : ''}${defAddr.city}, ${defAddr.state ? defAddr.state + ', ' : ''}${defAddr.pincode}`;
    }

    await user.save();
    
    res.json({ success: true, addresses: user.addresses, address: user.address });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, addressLine1, addressLine2, landmark, city, state, pincode, isDefault, coordinates } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const addrIndex = user.addresses.findIndex(a => a._id.toString() === id);
    if (addrIndex === -1) return res.status(404).json({ error: 'Address not found' });

    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses[addrIndex] = {
      ...user.addresses[addrIndex].toObject(),
      label: label || user.addresses[addrIndex].label,
      addressLine1: addressLine1 || user.addresses[addrIndex].addressLine1,
      addressLine2: addressLine2 !== undefined ? addressLine2 : user.addresses[addrIndex].addressLine2,
      landmark: landmark !== undefined ? landmark : user.addresses[addrIndex].landmark,
      city: city || user.addresses[addrIndex].city,
      state: state || user.addresses[addrIndex].state,
      pincode: pincode || user.addresses[addrIndex].pincode,
      coordinates: coordinates !== undefined ? coordinates : user.addresses[addrIndex].coordinates,
      isDefault: isDefault !== undefined ? isDefault : user.addresses[addrIndex].isDefault
    };

    const defAddr = user.addresses.find(a => a.isDefault);
    if (defAddr) {
      user.address = `${defAddr.addressLine1}, ${defAddr.addressLine2 ? defAddr.addressLine2 + ', ' : ''}${defAddr.landmark ? defAddr.landmark + ', ' : ''}${defAddr.city}, ${defAddr.state ? defAddr.state + ', ' : ''}${defAddr.pincode}`;
    }

    await user.save();

    res.json({ success: true, addresses: user.addresses, address: user.address });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.addresses = user.addresses.filter(a => a._id.toString() !== id);

    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    
    const defAddr = user.addresses.find(a => a.isDefault);
    if (defAddr) {
      user.address = `${defAddr.addressLine1}, ${defAddr.addressLine2 ? defAddr.addressLine2 + ', ' : ''}${defAddr.landmark ? defAddr.landmark + ', ' : ''}${defAddr.city}, ${defAddr.state ? defAddr.state + ', ' : ''}${defAddr.pincode}`;
    } else {
      user.address = '';
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses, address: user.address });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
